const fs=require('fs');const SR=44100,D=15,N=SR*D;
const L=new Float32Array(N),Rr=new Float32Array(N),SL=new Float32Array(N),SRv=new Float32Array(N);
let seed=9;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647*2-1};
const add=(i,v,pan=0,send=0)=>{if(i<0||i>=N)return;const l=v*Math.min(1,1-pan),r=v*Math.min(1,1+pan);L[i]+=l;Rr[i]+=r;SL[i]+=l*send;SRv[i]+=r*send};
const S=t=>Math.floor(t*SR);
const eio=t=>t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2;
// drone
for(let i=0;i<N;i++){const t=i/SR;const sw=Math.min(1,t/2)*(t<14?1:Math.max(0,(15-t)));
  const lfo=.6+.4*Math.sin(t*.8);
  add(i,(Math.sin(2*Math.PI*41.2*t)*.5+Math.sin(2*Math.PI*82.6*t)*.18*lfo+Math.sin(2*Math.PI*123.5*t)*.05)*sw*.32,0,.1)}
// tic-tac hook
for(let k=0;k*.25<2.6;k++){const s=S(.1+k*.25);const f=k%2?2400:1800;for(let i=0;i<SR*.03;i++){const t=i/SR;add(s+i,Math.sin(2*Math.PI*f*t)*Math.exp(-t*260)*.25,k%2?.4:-.4,.4)}}
// riser 1.6 -> 2.7
{let ph=0,lp=0;const a=S(1.5),b=S(2.7);for(let i=a;i<b;i++){const p=(i-a)/(b-a);const f=150+900*p*p;ph+=2*Math.PI*f/SR;lp+=(rnd()-lp)*(.02+.4*p);add(i,(Math.sin(ph)*.12+lp*.5)*p*p,Math.sin(p*20)*.3,.5)}}
function whoosh(T,len=.45,amp=.45){let lp=0;const a=S(T-len);for(let i=0;i<SR*(len+.35);i++){const t=i/SR;const p=t/len;const env=t<len?Math.pow(p,3):Math.exp(-(t-len)*12);lp+=(rnd()-lp)*(.03+.3*Math.min(p,1));add(a+i,lp*env*amp,Math.cos(p*3)*.6,.6)}}
function impact(T,amp=1){const s=S(T);let ph=0;for(let i=0;i<SR*1.4;i++){const t=i/SR;ph+=2*Math.PI*(32+90*Math.exp(-t*14))/SR;add(s+i,Math.tanh(Math.sin(ph)*2)*Math.exp(-t*2.6)*.7*amp,0,.3)}
  let lp=0;for(let i=0;i<SR*.5;i++){const t=i/SR;lp+=(rnd()-lp)*.25;add(s+i,lp*Math.exp(-t*9)*.6*amp,0,.8)}}
function braam(T,dur=2.2,amp=1){const s=S(T);const fs=[41.2,61.7,82.4,123.5];for(let i=0;i<SR*dur;i++){const t=i/SR;const env=Math.min(1,t/.03)*Math.exp(-t*1.4);let v=0;
  fs.forEach((f,k)=>{let x=0;for(let h=1;h<=9;h++)x+=Math.sin(2*Math.PI*f*h*t*(1+.003*k))/h;v+=x});
  add(s+i,Math.tanh(v*.6)*env*.28*amp,0,.5)}}
function shimmer(T,base=1318.5,amp=.08){const s=S(T);[1,1.5,2,3].forEach((m,k)=>{for(let i=0;i<SR*1.6;i++){const t=i/SR;add(s+i+S(k*.05),Math.sin(2*Math.PI*base*m*t)*Math.exp(-t*2.5)*amp/(k+1),k%2?.6:-.6,.9)}})}
function pluck(T,f,amp=.18,pan=0){const s=S(T);for(let i=0;i<SR*.5;i++){const t=i/SR;add(s+i,(Math.sin(2*Math.PI*f*t)+.4*Math.sin(4*Math.PI*f*t)+.2*Math.sin(6*Math.PI*f*t))*Math.exp(-t*9)*amp,pan,.5)}}
// transitions
[2.7,5.9,8.9,11.7].forEach((T,j)=>{whoosh(T,.45,j?.4:.25);impact(T,j?.55:.4)});
// reveal pièce
braam(3.75,2.4,1);impact(3.75,1);shimmer(3.8);
// beat 4.25 -> 14
const B=.5;
for(let k=0;;k++){const t0=4.25+k*B/2;if(t0>=14)break;const st=k%8;
  if(st===0||st===5){const s=S(t0);let ph=0;for(let i=0;i<SR*.45;i++){const t=i/SR;ph+=2*Math.PI*(42+120*Math.exp(-t*28))/SR;add(s+i,Math.sin(ph)*Math.exp(-t*6)*.8)}}
  if(st===4){const s=S(t0);let lp=0;for(let i=0;i<SR*.3;i++){const t=i/SR;lp+=(rnd()-lp)*.5;add(s+i,(lp*.7+Math.sin(2*Math.PI*190*t)*.25)*Math.exp(-t*16)*.55,0,.7)}}
  const subs=(k%16===14)?3:1;for(let q=0;q<subs;q++){const s=S(t0+q*B/6);let pr=0;for(let i=0;i<SR*.04;i++){const n=rnd();add(s+i,(n-pr)*Math.exp(-i/SR*90)*.12,(k%2?.35:-.35),.1);pr=n}}
}
// cartes tokenomics
[0,1,2,3].forEach(i=>pluck(5.9+.4+i*.13,[659.3,784,987.8,1318.5][i],.13,(i-1.5)*.3));
// nœuds roadmap
const inv=y=>{let a=0,b=1;for(let i=0;i<30;i++){const m=(a+b)/2;eio(m)<y?a=m:b=m}return(a+b)/2};
for(let i=0;i<4;i++){const nx=260+1400*i/3,tn=(nx-140)/(1700-140);const tl=.3+1.9*inv(tn);pluck(8.9+tl,[440,554.4,659.3,880][i],.2,(i-1.5)*.35);shimmer(8.9+tl,1760,.03)}
// final
braam(12.15,2.8,.9);impact(12.15,.9);shimmer(12.2,1318.5,.1);
for(let i=S(12.15);i<N;i++){const t=i/SR-12.15;const env=Math.min(1,t/.6)*Math.max(0,Math.min(1,(15-i/SR)/.8));[164.8,207.7,246.9,329.6].forEach((f,k)=>add(i,Math.sin(2*Math.PI*f*(i/SR))*env*.03,k%2?.4:-.4,.6))}
// réverb Schroeder
function verb(inp,seedOff){const out=new Float32Array(N);const combs=[1557,1617,1491,1422].map(d=>d+seedOff);
  for(const d of combs){const buf=new Float32Array(d);let idx=0,lp=0;for(let i=0;i<N;i++){const y=buf[idx];lp=y*.6+lp*.4;buf[idx]=inp[i]+lp*.84;out[i]+=y*.25;idx=(idx+1)%d}}
  for(const d of [225,556]){const buf=new Float32Array(d);let idx=0;for(let i=0;i<N;i++){const b=buf[idx],x=out[i];const y=-x+b;buf[idx]=x+b*.5;out[i]=y;idx=(idx+1)%d}}return out}
const vL=verb(SL,0),vR=verb(SRv,23);
const out=Buffer.alloc(44+N*4);let peak=0;const mL=new Float32Array(N),mR=new Float32Array(N);
for(let i=0;i<N;i++){mL[i]=L[i]+vL[i]*.9;mR[i]=Rr[i]+vR[i]*.9;peak=Math.max(peak,Math.abs(mL[i]),Math.abs(mR[i]))}
for(let i=0;i<N;i++){const t=i/SR;const g=Math.min(1,t/.05)*Math.min(1,(15-t)/.4);[mL,mR].forEach((a,c)=>out.writeInt16LE(Math.round(Math.tanh(a[i]/peak*1.6)*.92*g*32767),44+i*4+c*2))}
out.write('RIFF',0);out.writeUInt32LE(36+N*4,4);out.write('WAVEfmt ',8);out.writeUInt32LE(16,16);out.writeUInt16LE(1,20);out.writeUInt16LE(2,22);out.writeUInt32LE(SR,24);out.writeUInt32LE(SR*4,28);out.writeUInt16LE(4,32);out.writeUInt16LE(16,34);out.write('data',36);out.writeUInt32LE(N*4,40);
fs.writeFileSync('audio2.wav',out);
