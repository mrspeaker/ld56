var e=Object.defineProperty,t=(t,s,i)=>((t,s,i)=>s in t?e(t,s,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[s]=i)(t,"symbol"!=typeof s?s+"":s,i);import{p as s}from"./phaser-DJc9ez-r.js";!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver((e=>{for(const s of e)if("childList"===s.type)for(const e of s.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&t(e)})).observe(document,{childList:!0,subtree:!0})}function t(e){if(e.ep)return;e.ep=!0;const t=function(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?t.credentials="include":"anonymous"===e.crossOrigin?t.credentials="omit":t.credentials="same-origin",t}(e);fetch(e.href,t)}}();class i extends s.Scene{constructor(){super("Boot")}preload(){this.load.image("background","assets/bg.png")}create(){this.scene.start("Preloader")}}class a extends Phaser.GameObjects.Sprite{constructor(e,s,i){super(e,s,i,"drop"),t(this,"target"),t(this,"speed"),this.speed=Phaser.Math.FloatBetween(.13,.25),this.angle=Phaser.Math.Angle.RandomDegrees(),this.playAfterDelay("drop",Phaser.Math.Between(0,1500))}add_handlers(){const e=this;e.on("pointerdown",(()=>{e.target=null})),e.on("pointerover",(()=>{e.setTint(65280)})),e.on("pointerout",(()=>{e.setTint(16777215)}))}update(){if(!this.target)return!1;const{target:e,speed:t}=this,s=Phaser.Math.Angle.Between(this.x,this.y,e.x,e.y);return this.x+=Math.cos(s)*t,this.y+=Math.sin(s)*t,this.angle+=.5,Phaser.Math.Distance.Between(this.x,this.y,e.x,e.y)<10&&(this.target=null,!0)}}class h extends Phaser.GameObjects.Sprite{constructor(e,s){super(e,0,0,"meta"),t(this,"timer"),t(this,"charge_time"),this.visible=!1,this.x=100,this.y=40,this.timer=0,this.charge_time=s}ignite(e,t,s){this.timer=this.charge_time,this.visible=!0,this.x=e,this.y=t,this.scale=.75,this.play("meta")}update(){return!(this.timer>0&&(this.timer--,0==this.timer)&&(this.visible=!1,1))}explode(){return this.timer<=0}}var o=(e=>(e[e.AI_BOT=0]="AI_BOT",e[e.BLOB1=1]="BLOB1",e[e.BLOB2=2]="BLOB2",e))(o||{}),l=(e=>(e[e.EMPTY=0]="EMPTY",e[e.MOVING_IN=1]="MOVING_IN",e[e.ALIVE=2]="ALIVE",e[e.WHACKED=3]="WHACKED",e[e.MISSED=4]="MISSED",e[e.MOVING_OUT=5]="MOVING_OUT",e))(l||{});class n{constructor(e){t(this,"type"),t(this,"state"),t(this,"timer"),t(this,"life"),t(this,"idx"),t(this,"key_gfx"),this.state=0,this.timer=0,this.idx=e,this.life=0}is_baddie(){return 0==this.type}}const r=Phaser.Input.Keyboard.KeyCodes,d=class e extends s.Scene{constructor(){super("Game"),t(this,"camera"),t(this,"bg"),t(this,"msg_text"),t(this,"keys"),t(this,"state"),t(this,"state_time"),t(this,"slots"),t(this,"slot_gfx"),t(this,"cells"),t(this,"bombs"),t(this,"bomb_group"),t(this,"score_text"),t(this,"hp_text"),t(this,"theme"),t(this,"sfx"),t(this,"NUM_COLS",3),t(this,"NUM_ROWS",2),t(this,"NUM_MOLES",6),t(this,"last_flash"),t(this,"score"),t(this,"health"),t(this,"bomb_cooldown"),t(this,"whacks_good"),t(this,"whacks_bad"),t(this,"whacks_missed"),t(this,"cells_killed"),t(this,"cells_escaped"),t(this,"cell_spawn_timer"),t(this,"cell_spawn_rate"),t(this,"cell_spawn_rate_inc"),t(this,"cell_spawn_rate_fastest"),t(this,"cell_spawn_speed_base"),t(this,"cell_spawn_speed_inc"),t(this,"slot_spawn_chance"),t(this,"slot_spawn_chance_max"),t(this,"slot_spawn_chance_inc"),t(this,"slot_spawn_ai_chance"),t(this,"slot_spawn_life"),t(this,"slot_spawn_life_min"),t(this,"slot_spawn_life_deviation"),t(this,"slot_spawn_life_inc")}init(){this.state=0,this.health=100,this.score=0,this.bomb_cooldown=0,this.whacks_good=0,this.whacks_bad=0,this.whacks_missed=0,this.cells_killed=0,this.cells_escaped=0,this.cell_spawn_timer=500,this.cell_spawn_rate=110,this.cell_spawn_rate_inc=-1.8,this.cell_spawn_rate_fastest=30,this.cell_spawn_speed_base=.35,this.cell_spawn_speed_inc=.01,this.slot_spawn_chance=.08,this.slot_spawn_chance_max=10,this.slot_spawn_chance_inc=5e-5,this.slot_spawn_life_min=40,this.slot_spawn_life=100,this.slot_spawn_life_deviation=15,this.slot_spawn_life_inc=-.01,this.slot_spawn_ai_chance=.6,this.slots=[],this.slot_gfx=[],this.cells=[],this.bombs=[],this.last_flash=Date.now()}get_cell_target(e,t){const{camera:s}=this,i=new Phaser.Geom.Point(s.centerX,s.centerY),a=Phaser.Math.Angle.Between(e,t,i.x,i.y);return i.x-=200*Math.cos(a),i.y-=200*Math.sin(a),i}create(){var t,s;const{add:i,input:o}=this;o.setDefaultCursor("url(assets/syr.png), pointer");const l=this.sound.add("theme",{volume:.5});l.play(),l.loop=!0,this.theme=l,this.sfx={laugh:this.sound.add("laugh",{volume:1}),ohno:this.sound.add("ohno",{volume:1}),punch:this.sound.add("punch",{volume:1}),splode:this.sound.add("splode",{volume:1}),yell:this.sound.add("yell",{volume:1}),exp:this.sound.add("exp",{volume:1}),exp2:this.sound.add("exp2",{volume:.5}),happy:this.sound.add("happy",{volume:.5})};const d=this.camera=this.cameras.main;this.camera.setBackgroundColor(0),this.camera.postFX.addVignette(.5,.5,.9,.3),null==(t=o.keyboard)||t.addKey(r.ESC).on("down",(()=>{confirm("Quit?")&&(this.theme.stop(),this.scene.start("MainMenu"))}));const c=180*this.NUM_COLS-0,p=180*this.NUM_ROWS-0;this.bg=i.image(d.centerX,d.centerY,"background"),this.bg.setAlpha(.1),this.bg.setDisplaySize(d.width,d.height),this.bg.postFX.addVignette(.5,.5,.6),this.add.circle(d.centerX,d.centerY,e.RADIUS,0,.8),this.add.circle(d.centerX,d.centerY,e.RADIUS,8257405,.1);const _={fontFamily:"Arial Black",fontSize:38,color:"#ffffff",stroke:"#000000",strokeThickness:8,align:"center"};if(this.score_text=i.text(392,15,"0",_),this.hp_text=i.text(720,15,"100",_),this.add.image(d.centerX-200,40,"score"),this.add.image(d.centerX+150,40,"hp"),!o.keyboard)return;const m=this.add.group();for(let h=0;h<e.MAX_CELLS;h++){const e=new a(this,0,0);e.visible=!1,e.setScale(Phaser.Math.FloatBetween(.3,.8)),this.cells.push(e),m.add(e,!0)}this.bomb_group=this.add.group();for(let a=0;a<e.MAX_BOMBS;a++){const e=new h(this,30);this.bombs.push(e),this.bomb_group.add(e,!0)}this.add.group().setDepth(2),this.slot_gfx=this.add.group({key:"blerb",frameQuantity:this.NUM_MOLES}).getChildren();const g=(d.width-c)/2,f=(d.height-p)/2;for(let e=0;e<this.NUM_MOLES;e++){const t=e%this.NUM_COLS*180+90+g,s=180*Math.floor(e/this.NUM_COLS)+90+f,i=new n(e);i.key_gfx=this.add.text(t-50,s-50,"QWEDSA".split("")[e],{fontFamily:"Arial Black",fontSize:18,color:"#ffffff"}),this.slots.push(i);const a=e/this.NUM_MOLES*Math.PI*2-Phaser.Math.DegToRad(145),h=160;this.slot_gfx[e].x=d.centerX+Math.cos(a)*h,this.slot_gfx[e].y=d.centerY+Math.sin(a)*h,this.slot_gfx[e].visible=!1,i.key_gfx.x=d.centerX+240*Math.cos(a-.1),i.key_gfx.y=d.centerY+240*Math.sin(a-.1)}const u=["Q","W","E","D","S","A"];if((null==window?void 0:window.URLSearchParams)&&(null==(s=null==window?void 0:window.location)?void 0:s.search))for(let e=0;e<u.length;e++){const t=new URLSearchParams(window.location.search),s=(e+1).toString();if(t.has(s)){const i=t.get(s).toUpperCase(),a=r[i];a&&(console.log("switching keys. Was:",u[e],"Now:",s,i,a),u[e]=i)}}this.keys=u.map((e=>o.keyboard.addKey(r[e]))),o.keyboard.addKey(r.SPACE).once("down",(()=>{})),this.add.particles(0,100,"drop",{x:{min:0,max:d.width},y:{min:-100,max:d.height},quantity:1,lifespan:200,tint:16776960,blendMode:Phaser.BlendModes.LIGHTER,accelerationX:[-100,100],accelerationY:[-100,100],scale:.1}),this.add.image(d.centerX,d.centerY,"glass").setAlpha(.14);const w=this.add.image(150,400,"helpbot");w.setAlpha(0);const b=this.add.image(870,400,"helpmouse");b.setAlpha(0),b.setScale(.8),this.tweens.chain({targets:w,onComplete:()=>{w.destroy()},tweens:[{alpha:1,delay:1e3,duration:1e3},{alpha:0,delay:3e3,duration:1e3}]}),this.tweens.chain({targets:b,onComplete:()=>{b.destroy()},tweens:[{alpha:1,delay:9e3,duration:1e3},{alpha:0,delay:3e3,duration:1e3}]})}draw_score(){this.score_text.text=this.score.toFixed(0),this.hp_text.text=this.health.toFixed(0)}flash(){const e=Date.now(),t=e-this.last_flash;this.last_flash=e,t<500||this.camera.flash(100,255,0,0)}update(){switch(this.state){case 0:this.update_playing();break;case 1:this.update_dead()}this.draw_score()}update_playing(){const{cells:t,camera:s,slots:i,bombs:a}=this;if(t.forEach((e=>{e.update()&&(this.health+=-5,this.sfx.exp.play(),this.cells_escaped++,e.visible=!1)})),this.cell_spawn_timer--<=0){const e=t.find((e=>null==e.target));if(e){e.visible=!0;const t=Phaser.Math.FloatBetween(0,2*Math.PI);e.x=Math.cos(t)*s.width/2+s.centerX,e.y=Math.sin(t)*s.height/2+s.centerY,e.target=this.get_cell_target(e.x,e.y),e.speed=this.cell_spawn_speed_base,this.cell_spawn_speed_base+=this.cell_spawn_speed_inc}this.cell_spawn_timer=this.cell_spawn_rate,this.cell_spawn_rate=Math.max(this.cell_spawn_rate_fastest,this.cell_spawn_rate+this.cell_spawn_rate_inc)}a.forEach((e=>{if(!e.update()){const s=this.add.sprite(e.x,e.y,"hit").play("hit");s.once("animationcomplete",(()=>{s.destroy()})),t.forEach((t=>{Phaser.Math.Distance.Between(e.x,e.y,t.x,t.y)<80&&(this.score+=20,this.sfx.exp2.play(),this.cells_killed++,t.target=null,t.visible=!1)}))}}));const h=this.input.activePointer;if(this.bomb_cooldown--,h.isDown&&this.bomb_cooldown<=0&&Phaser.Math.Distance.Between(s.centerX,s.centerY,h.position.x,h.position.y)>=.85*e.RADIUS){this.bomb_cooldown=20,this.sfx.splode.play();const e=this.bombs.find((e=>e.explode()));e&&e.ignite(h.position.x,h.position.y,this)}i.forEach((e=>this.handle_slot(e))),this.spawn_slots(),this.health>100&&(this.health=100),this.health<=0&&(this.health=0,this.theme.stop(),this.state=1,this.state_time=0),s.backgroundColor.red=this.health>50?0:(50-this.health)/50*40}update_dead(){1===this.state_time&&(this.flash(),this.sfx.punch.play()),this.state_time++<100||this.scene.start("GameOver",{score:this.score,whacks_good:this.whacks_good,whacks_bad:this.whacks_bad,whacks_missed:this.whacks_missed,cells_killed:this.cells_killed,cells_escaped:this.cells_escaped})}handle_slot(e){var t,s;const{keys:i,slot_gfx:a}=this;switch(i[e.idx].isDown?null==(t=e.key_gfx)||t.setTint(16746496):null==(s=e.key_gfx)||s.setTint(16777215),e.state){case l.MOVING_IN:e.timer--<=0&&(a[e.idx].visible=!0,a[e.idx].setAngle(Phaser.Math.FloatBetween(-20,20)),e.type==o.AI_BOT?a[e.idx].play(["bot1","sidebot"][Phaser.Math.Between(0,1)]):a[e.idx].play(["bot1","blerb","blerb2"][e.type]),e.state=l.ALIVE,e.timer=e.life);break;case l.ALIVE:i[e.idx].isDown&&this.handle_whack(e,e.idx),e.timer--<=0&&(e.state=l.MISSED,e.is_baddie()?(this.whacks_missed++,this.health+=-10,this.flash(),this.sfx.laugh.play()):(this.sfx.happy.play(),this.score+=8,this.tweens.add({targets:a[e.idx],alpha:0,duration:250})));break;case l.WHACKED:e.state=l.MOVING_OUT,e.timer=25;break;case l.MISSED:a[e.idx].flipY=!0,e.state=l.MOVING_OUT,e.timer=25;break;case l.MOVING_OUT:e.timer--<=0&&(e.state=l.EMPTY,a[e.idx].visible=!1,a[e.idx].flipY=!1,a[e.idx].alpha=1)}}handle_whack(e,t){const{camera:s}=this;e.state=l.WHACKED;const i=this.add.sprite(this.slot_gfx[t].x,this.slot_gfx[t].y,"hit").play("hit",!1).once("animationcomplete",(()=>{i.destroy()}));s.shake(100,.01),this.sfx.punch.play(),e.is_baddie()?(this.score+=100,this.health+=0,this.whacks_good++,this.slot_gfx[t].play("bot1_die"),this.sfx.yell.play()):(this.health+=-13,this.whacks_bad++,this.slot_gfx[t].visible=!1,this.flash(),this.sfx.ohno.play())}spawn_slots(){const{slots:e}=this;if(Phaser.Math.Between(0,1e3)<100*this.slot_spawn_chance){const t=e.filter((e=>e.state==l.EMPTY));if(0==t.length)return;const s=Phaser.Utils.Array.GetRandom(t);s.state=l.MOVING_IN,s.timer=30,s.type=Phaser.Math.Between(0,100)<100*this.slot_spawn_ai_chance?o.AI_BOT:Phaser.Math.Between(0,100)<50?o.BLOB1:o.BLOB2,s.life=Math.max(this.slot_spawn_life_min,this.slot_spawn_life+Phaser.Math.Between(-this.slot_spawn_life_deviation,this.slot_spawn_life_deviation))}this.slot_spawn_chance=Math.min(this.slot_spawn_chance_max,this.slot_spawn_chance+this.slot_spawn_chance_inc),this.slot_spawn_life=Math.max(this.slot_spawn_life_min,this.slot_spawn_life+this.slot_spawn_life_inc)}};t(d,"MAX_CELLS",50),t(d,"MAX_BOMBS",30),t(d,"RADIUS",220);let c=d;class p extends s.Scene{constructor(){super("GameOver"),t(this,"camera"),t(this,"background"),t(this,"gameover_text"),t(this,"stats"),t(this,"score"),t(this,"whacks_good"),t(this,"whacks_bad"),t(this,"whacks_missed"),t(this,"cells_killed"),t(this,"cells_escaped"),t(this,"cooldown")}init(e){this.score=e.score,this.whacks_good=e.whacks_good,this.whacks_bad=e.whacks_bad,this.whacks_missed=e.whacks_missed,this.cells_killed=e.cells_killed,this.cells_escaped=e.cells_escaped,this.cooldown=100}update(){this.cooldown--}create(){var e;this.camera=this.cameras.main,this.camera.setBackgroundColor(0),this.sound.add("yell",{volume:1}).play(),this.add.image(512,300,"gameover");const t={fontFamily:"Arial Black",fontSize:64,color:"#ffffff",align:"center"};this.gameover_text=this.add.text(512,398,this.score.toFixed(0),t),this.gameover_text.setOrigin(.5);const s=Math.max(1,this.whacks_good+this.whacks_missed),i=this.whacks_good/s;this.stats=this.add.text(750,400,`bots destroyed: ${Math.round(100*i)}%\ngood guys killed: ${this.whacks_bad}\ncells destroyed: ${this.cells_killed}`,{...t,fontSize:24}),this.input.on("pointerdown",(()=>{this.cooldown<=0&&this.scene.start("MainMenu")})),null==(e=this.input.keyboard)||e.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down",(()=>{this.cooldown<=0&&this.scene.start("MainMenu")}))}}class _ extends s.Scene{constructor(){super("MainMenu"),t(this,"background"),t(this,"logo"),t(this,"title")}create(){var e;this.input.setDefaultCursor("url(assets/syr.png), pointer"),this.add.image(100,180,"bad"),this.add.sprite(70,280,"bot1").play("bot1"),this.add.sprite(180,270,"drop").play("drop"),this.add.image(950,420,"good"),this.add.sprite(860,560,"blerb").play("blerb"),this.add.sprite(980,530,"blerb2").play("blerb2");const t=this.add.image(500,400,"glass");this.add.image(512,400,"logo"),t.setAlpha(.2),this.add.image(120,620,"keymouse"),this.input.once("pointerdown",(()=>{this.scene.start("Game")})),null==(e=this.input.keyboard)||e.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once("down",(()=>{this.scene.start("Game")}))}}class m extends s.Scene{constructor(){super("Preloader")}init(){this.add.rectangle(512,384,468,32).setStrokeStyle(1,16777215);const e=this.add.rectangle(282,384,4,28,16777215);this.load.on("progress",(t=>{e.width=4+460*t}))}preload(){this.load.setPath("assets"),this.load.image("logo","logo.png"),this.load.image("gameover","gameover.png"),this.load.image("bad","bad.png"),this.load.image("good","good.png"),this.load.image("keymouse","keymouse.png"),this.load.image("glass","glass.png"),this.load.image("score","score.png"),this.load.image("hp","hp.png"),this.load.image("helpbot","helpbot.png"),this.load.image("helpmouse","helpmouse.png"),this.load.audio("theme",["sfx/squirf.mp3","sfx/squirf.ogg"]),this.load.audio("laugh","sfx/laugh.mp3"),this.load.audio("ohno","sfx/ohno.mp3"),this.load.audio("punch","sfx/punch.mp3"),this.load.audio("happy","sfx/happy.mp3"),this.load.audio("splode","sfx/rev-bleb.mp3"),this.load.audio("yell","sfx/yell-get.mp3"),this.load.audio("exp","sfx/exp.mp3"),this.load.audio("exp2","sfx/exp2.mp3"),this.load.spritesheet("hit","hit.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("meta","meta.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("blerb","blerb.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("blerb2","blerb2.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("drop","drop.png",{frameWidth:96,frameHeight:96}),this.load.spritesheet("bot1","bot1.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("sidebot","sidebot.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("mol","mol.png",{frameWidth:512,frameHeight:288})}create(){this.anims.create({key:"hit",frames:this.anims.generateFrameNumbers("hit"),frameRate:30,repeat:0}),this.anims.create({key:"blerb",frames:this.anims.generateFrameNumbers("blerb"),frameRate:8,repeat:-1}),this.anims.create({key:"blerb2",frames:this.anims.generateFrameNumbers("blerb2"),frameRate:10,repeat:-1}),this.anims.create({key:"drop",frames:this.anims.generateFrameNumbers("drop"),frameRate:12,repeat:-1}),this.anims.create({key:"bot1",frames:this.anims.generateFrameNumbers("bot1",{start:0,end:9}),frameRate:9,repeat:-1}),this.anims.create({key:"sidebot",frames:this.anims.generateFrameNumbers("sidebot",{start:0,end:9}),frameRate:9,repeat:-1}),this.anims.create({key:"bot1_die",frames:this.anims.generateFrameNumbers("bot1",{start:10,end:19}),frameRate:20,repeat:0}),this.anims.create({key:"mol",frames:this.anims.generateFrameNumbers("mol"),frameRate:3,repeat:-1}),this.anims.create({key:"meta",frames:this.anims.generateFrameNumbers("meta"),frameRate:30,repeat:-1}),this.scene.start("MainMenu")}}const g={type:Phaser.AUTO,width:1024,height:768,parent:"game-container",backgroundColor:"#000",pixelArt:!1,fps:{limit:60},scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[i,m,_,c,p]};new s.Game(g);
