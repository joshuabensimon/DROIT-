const {chromium}=require('playwright');const fs=require('fs');const {spawn}=require('child_process');
(async()=>{
 const mode=process.argv[2];
 const b=await chromium.launch();const p=await b.newPage({viewport:{width:1920,height:1080}});
 p.on('console',m=>console.log('console',m.text()));p.on('pageerror',e=>console.log('ERR',e.message));
 await p.goto('file://'+__dirname+'/'+(process.env.SRC||'anim.html'));await p.evaluate(()=>window.ready);
 const grab=t=>p.evaluate(t=>{renderFrame(t);return document.getElementById('c').toDataURL('image/jpeg',0.94).split(',')[1]},t);
 if(mode==='stills'){const ts=process.argv.slice(3);
   for(const t of ts){fs.writeFileSync(`still_${t}.jpg`,Buffer.from(await grab(+t),'base64'))}}
 else{
   const ff=spawn('ffmpeg',['-y','-f','image2pipe','-framerate','30','-c:v','mjpeg','-i','-','-c:v','libx264','-pix_fmt','yuv420p','-crf','17','-preset','slow',(process.env.OUT||'video.mp4')],{stdio:['pipe','ignore','inherit']});
   for(let f=0;f<450;f++){const buf=Buffer.from(await grab(f/30),'base64');if(!ff.stdin.write(buf))await new Promise(r=>ff.stdin.once('drain',r));}
   ff.stdin.end();await new Promise(r=>ff.on('close',r));
 }
 await b.close();
})();
