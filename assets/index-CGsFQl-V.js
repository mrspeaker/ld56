var e=Object.defineProperty,t=(t,s,i)=>((t,s,i)=>s in t?e(t,s,{enumerable:!0,configurable:!0,writable:!0,value:i}):t[s]=i)(t,"symbol"!=typeof s?s+"":s,i);import{p as s}from"./phaser-DJc9ez-r.js";!function(){const e=document.createElement("link").relList;if(!(e&&e.supports&&e.supports("modulepreload"))){for(const e of document.querySelectorAll('link[rel="modulepreload"]'))t(e);new MutationObserver((e=>{for(const s of e)if("childList"===s.type)for(const e of s.addedNodes)"LINK"===e.tagName&&"modulepreload"===e.rel&&t(e)})).observe(document,{childList:!0,subtree:!0})}function t(e){if(e.ep)return;e.ep=!0;const t=function(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),"use-credentials"===e.crossOrigin?t.credentials="include":"anonymous"===e.crossOrigin?t.credentials="omit":t.credentials="same-origin",t}(e);fetch(e.href,t)}}();class i extends s.Scene{constructor(){super("Boot")}preload(){this.load.image("background","assets/bg.png")}create(){this.scene.start("Preloader")}}class a extends Phaser.GameObjects.Sprite{constructor(e,s,i){super(e,s,i,"drop"),t(this,"target"),t(this,"speed"),this.speed=Phaser.Math.FloatBetween(.13,.25),this.angle=Phaser.Math.Angle.RandomDegrees(),this.playAfterDelay("drop",Phaser.Math.Between(0,1500))}add_handlers(){const e=this;e.on("pointerdown",(()=>{e.target=null})),e.on("pointerover",(()=>{e.setTint(65280)})),e.on("pointerout",(()=>{e.setTint(16777215)}))}update(){if(!this.target)return!1;const{target:e,speed:t}=this,s=Phaser.Math.Angle.Between(this.x,this.y,e.x,e.y);return this.x+=Math.cos(s)*t,this.y+=Math.sin(s)*t,this.angle+=.5,Phaser.Math.Distance.Between(this.x,this.y,e.x,e.y)<10&&(this.target=null,!0)}}class h extends Phaser.GameObjects.Sprite{constructor(e,s){super(e,0,0,"meta"),t(this,"timer"),t(this,"charge_time"),this.visible=!1,this.x=100,this.y=40,this.timer=0,this.charge_time=s}ignite(e,t,s){this.timer=this.charge_time,this.visible=!0,this.x=e,this.y=t,this.scale=.75,this.play("meta")}update(){return!(this.timer>0&&(this.timer--,0==this.timer)&&(this.visible=!1,1))}explode(){return this.timer<=0}}var r=(e=>(e[e.AI_BOT=0]="AI_BOT",e[e.BLOB1=1]="BLOB1",e[e.BLOB2=2]="BLOB2",e))(r||{}),o=(e=>(e[e.EMPTY=0]="EMPTY",e[e.MOVING_IN=1]="MOVING_IN",e[e.ALIVE=2]="ALIVE",e[e.WHACKED=3]="WHACKED",e[e.MISSED=4]="MISSED",e[e.MOVING_OUT=5]="MOVING_OUT",e))(o||{});class n{constructor(e){t(this,"type"),t(this,"state"),t(this,"timer"),t(this,"life"),t(this,"idx"),this.state=0,this.timer=0,this.idx=e,this.life=0}is_baddie(){return 0==this.type}}const l=Phaser.Input.Keyboard.KeyCodes,c=class e extends s.Scene{constructor(){super("Game"),t(this,"camera"),t(this,"bg"),t(this,"msg_text"),t(this,"keys"),t(this,"slots"),t(this,"slot_gfx"),t(this,"cells"),t(this,"bombs"),t(this,"bomb_group"),t(this,"NUM_COLS",3),t(this,"NUM_ROWS",2),t(this,"NUM_MOLES",6),t(this,"score"),t(this,"health"),t(this,"bomb_cooldown"),t(this,"whacks_good"),t(this,"whacks_bad"),t(this,"whacks_missed"),t(this,"cells_killed"),t(this,"cells_escaped"),t(this,"cell_spawn_timer"),t(this,"cell_spawn_rate"),t(this,"cell_spawn_rate_inc"),t(this,"cell_spawn_rate_fastest"),t(this,"cell_spawn_speed_base"),t(this,"cell_spawn_speed_inc"),t(this,"slot_spawn_chance"),t(this,"slot_spawn_chance_max"),t(this,"slot_spawn_chance_inc"),t(this,"slot_spawn_ai_chance"),t(this,"slot_spawn_life"),t(this,"slot_spawn_life_min"),t(this,"slot_spawn_life_deviation"),t(this,"slot_spawn_life_inc")}init(){this.health=100,this.score=0,this.bomb_cooldown=0,this.whacks_good=0,this.whacks_bad=0,this.whacks_missed=0,this.cells_killed=0,this.cells_escaped=0,this.cell_spawn_timer=500,this.cell_spawn_rate=150,this.cell_spawn_rate_inc=-2,this.cell_spawn_rate_fastest=5,this.cell_spawn_speed_base=.05,this.cell_spawn_speed_inc=.01,this.slot_spawn_chance=.08,this.slot_spawn_chance_max=1,this.slot_spawn_chance_inc=.001,this.slot_spawn_life_min=40,this.slot_spawn_life=100,this.slot_spawn_life_deviation=15,this.slot_spawn_life_inc=-.2,this.slot_spawn_ai_chance=.6,this.slots=[],this.slot_gfx=[],this.cells=[],this.bombs=[]}get_cell_target(e,t){const{camera:s}=this,i=new Phaser.Geom.Point(s.centerX,s.centerY),a=Phaser.Math.Angle.Between(e,t,i.x,i.y);return i.x-=200*Math.cos(a),i.y-=200*Math.sin(a),i}create(){const{add:t,input:s}=this;s.setDefaultCursor("url(assets/syr.png), pointer");const i=this.camera=this.cameras.main;this.camera.setBackgroundColor(0);const r=180*this.NUM_COLS-0,o=180*this.NUM_ROWS-0;this.bg=t.image(i.centerX,i.centerY,"background"),this.bg.setAlpha(.1),this.bg.setDisplaySize(i.width,i.height),this.bg.postFX.addVignette(.5,.5,.6),this.add.circle(i.centerX,i.centerY,e.RADIUS,0,.8),this.add.circle(i.centerX,i.centerY,e.RADIUS,8257405,.1);const c=t.text(512,384,"LD56",{fontFamily:"Arial Black",fontSize:38,color:"#ffffff",stroke:"#000000",strokeThickness:8,align:"center"});if(c.setOrigin(.5),c.y=20,this.score_text=c,!s.keyboard)return;const d=this.add.group();for(let h=0;h<e.MAX_CELLS;h++){const e=new a(this,0,0);e.visible=!1,e.setScale(Phaser.Math.FloatBetween(.3,.8)),this.cells.push(e),d.add(e,!0)}this.bomb_group=this.add.group();for(let a=0;a<e.MAX_BOMBS;a++){const e=new h(this,30);this.bombs.push(e),this.bomb_group.add(e,!0)}this.add.group().setDepth(2),this.slot_gfx=this.add.group({key:"blerb",frameQuantity:this.NUM_MOLES}).getChildren();const _=(i.width-r)/2,p=(i.height-o)/2;for(let e=0;e<this.NUM_MOLES;e++){const t=e%this.NUM_COLS*180+90+_,s=180*Math.floor(e/this.NUM_COLS)+90+p,a=this.add.text(t-50,s-50,"QWEASD".split("")[e],{fontFamily:"Arial Black",fontSize:18,color:"#ffffff"});this.slots.push(new n(e));const h=e/this.NUM_MOLES*Math.PI*2-Phaser.Math.DegToRad(145),r=160;this.slot_gfx[e].x=i.centerX+Math.cos(h)*r,this.slot_gfx[e].y=i.centerY+Math.sin(h)*r,this.slot_gfx[e].visible=!1,a.x=i.centerX+240*Math.cos(h-.1),a.y=i.centerY+240*Math.sin(h-.1)}this.keys=[s.keyboard.addKey(l.Q),s.keyboard.addKey(l.W),s.keyboard.addKey(l.E),s.keyboard.addKey(l.D),s.keyboard.addKey(l.S),s.keyboard.addKey(l.A)],s.keyboard.addKey(l.SPACE).once("down",(()=>{})),this.add.particles(0,100,"drop",{x:{min:0,max:i.width},y:{min:-100,max:i.height},quantity:1,lifespan:200,tint:16776960,alpha:.5,blendMode:Phaser.BlendModes.LIGHTER,accelerationX:[-100,100],accelerationY:[-100,100],scale:.1}),this.add.image(i.centerX,i.centerY,"glass").setAlpha(.14)}draw_score(){this.score_text.text="SCORE: "+(this.score+"").padStart(5,"0")+" HP: "+this.health}update(){const{keys:t,cells:s,camera:i,slots:a,bombs:h}=this;if(s.forEach((e=>{e.update()&&(this.health-=1,this.cells_escaped++,e.visible=!1)})),this.cell_spawn_timer--<=0){const e=s.find((e=>null==e.target));if(e){e.visible=!0;const t=Phaser.Math.FloatBetween(0,2*Math.PI);e.x=Math.cos(t)*i.width/2+i.centerX,e.y=Math.sin(t)*i.height/2+i.centerY,e.target=this.get_cell_target(e.x,e.y),e.speed=this.cell_spawn_speed_base,this.cell_spawn_speed_base+=this.cell_spawn_speed_inc}this.cell_spawn_timer=this.cell_spawn_rate,this.cell_spawn_rate=Math.max(this.cell_spawn_rate_fastest,this.cell_spawn_rate+this.cell_spawn_rate_inc)}h.forEach((e=>{if(!e.update()){const t=this.add.sprite(e.x,e.y,"hit").play("hit");t.once("animationcomplete",(()=>{t.destroy()})),s.forEach((t=>{Phaser.Math.Distance.Between(e.x,e.y,t.x,t.y)<80&&(this.score+=20,this.cells_killed++,t.target=null,t.visible=!1)}))}}));const r=this.input.activePointer;if(this.bomb_cooldown--,r.isDown&&this.bomb_cooldown<=0&&Phaser.Math.Distance.Between(i.centerX,i.centerY,r.position.x,r.position.y)>=e.RADIUS){this.bomb_cooldown=20;const e=this.bombs.find((e=>e.explode()));e&&e.ignite(r.position.x,r.position.y,this)}this.draw_score(),a.forEach(((e,t)=>this.handle_slot(e,t))),this.spawn_slots(),this.health>100&&(this.health=100),this.health<=0&&this.scene.start("GameOver",{score:this.score,whacks_good:this.whacks_good,whacks_bad:this.whacks_bad,whacks_missed:this.whacks_missed,cells_killed:this.cells_killed,cells_escaped:this.cells_escaped})}handle_slot(e,t){const{keys:s,slot_gfx:i}=this;switch(e.state){case o.MOVING_IN:e.timer--<=0&&(i[e.idx].visible=!0,i[e.idx].setAngle(Phaser.Math.FloatBetween(-20,20)),i[e.idx].play(["bot1","blerb","blerb2"][e.type]),e.state=o.ALIVE,e.timer=e.life);break;case o.ALIVE:s[t].isDown&&this.handle_whack(e,t),e.timer--<=0&&(e.state=o.MISSED,e.is_baddie()&&(this.whacks_missed++,this.health+=-5));break;case o.WHACKED:e.state=o.MOVING_OUT,e.timer=25;break;case o.MISSED:i[e.idx].flipY=!0,e.state=o.MOVING_OUT,e.timer=25;break;case o.MOVING_OUT:e.timer--<=0&&(e.state=o.EMPTY,i[e.idx].visible=!1,i[e.idx].flipY=!1)}}handle_whack(e,t){const{camera:s}=this;e.state=o.WHACKED;const i=this.add.sprite(this.slot_gfx[t].x,this.slot_gfx[t].y,"hit").play("hit",!1).once("animationcomplete",(()=>{i.destroy()}));s.shake(100,.01),e.is_baddie()?(this.score+=100,this.health+=0,this.whacks_good++,this.slot_gfx[t].play("bot1_die")):(this.health+=-5,this.whacks_bad++,this.slot_gfx[t].visible=!1)}spawn_slots(){const{slots:e}=this;if(Phaser.Math.Between(0,1e3)<100*this.slot_spawn_chance){const t=e.filter((e=>e.state==o.EMPTY));if(0==t.length)return;const s=Phaser.Utils.Array.GetRandom(t);s.state=o.MOVING_IN,s.timer=30,s.type=Phaser.Math.Between(0,100)<100*this.slot_spawn_ai_chance?r.AI_BOT:Phaser.Math.Between(0,100)<50?r.BLOB1:r.BLOB2,s.life=Math.max(this.slot_spawn_life_min,this.slot_spawn_life+Phaser.Math.Between(-this.slot_spawn_life_deviation,this.slot_spawn_life_deviation)),this.slot_spawn_life=Math.max(this.slot_spawn_life_min,this.slot_spawn_life+this.slot_spawn_life_inc),this.slot_spawn_chance=Math.min(this.slot_spawn_chance_max,this.slot_spawn_chance+this.slot_spawn_chance_inc)}}};t(c,"MAX_CELLS",50),t(c,"MAX_BOMBS",30),t(c,"RADIUS",220);let d=c;class _ extends s.Scene{constructor(){super("GameOver"),t(this,"camera"),t(this,"background"),t(this,"gameover_text"),t(this,"score"),t(this,"whacks_good"),t(this,"whacks_bad"),t(this,"whacks_missed"),t(this,"cells_killed"),t(this,"cells_escaped"),t(this,"cooldown")}init(e){this.score=e.score,this.whacks_good=e.whacks_good,this.whacks_bad=e.whacks_bad,this.whacks_missed=e.whacks_missed,this.cells_killed=e.cells_killed,this.cells_escaped=e.cells_escaped,this.cooldown=100}update(){this.cooldown--}create(){var e;this.camera=this.cameras.main,this.camera.setBackgroundColor(0),this.add.image(512,300,"gameover");const t={fontFamily:"Arial Black",fontSize:64,color:"#ffffff",align:"center"};this.gameover_text=this.add.text(512,384,this.score,t),this.gameover_text.setOrigin(.5);const s=this.whacks_good/(this.whacks_good+this.whacks_missed);this.stats=this.add.text(800,400,`ai bots destroyed: ${Math.round(100*s)}%\ngood guys killed: ${this.whacks_bad}\ncells destroyed: ${this.cells_killed}`,{...t,fontSize:18}),this.input.on("pointerdown",(()=>{this.cooldown<=0&&this.scene.start("MainMenu")})),null==(e=this.input.keyboard)||e.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down",(()=>{this.cooldown<=0&&this.scene.start("MainMenu")}))}}class p extends s.Scene{constructor(){super("MainMenu"),t(this,"background"),t(this,"logo"),t(this,"title")}create(){var e;this.input.setDefaultCursor("url(assets/syr.png), pointer"),this.logo=this.add.image(512,250,"logo"),this.add.image(100,180,"bad"),this.add.sprite(70,280,"bot1").play("bot1"),this.add.sprite(180,270,"drop").play("drop"),this.add.image(880,340,"good"),this.add.sprite(800,480,"blerb").play("blerb"),this.add.sprite(920,430,"blerb2").play("blerb2"),this.add.image(520,620,"keymouse"),this.input.once("pointerdown",(()=>{this.scene.start("Game")})),null==(e=this.input.keyboard)||e.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).once("down",(()=>{this.scene.start("Game")}))}}class m extends s.Scene{constructor(){super("Preloader")}init(){this.add.image(512,384,"background"),this.add.rectangle(512,384,468,32).setStrokeStyle(1,16777215);const e=this.add.rectangle(282,384,4,28,16777215);this.load.on("progress",(t=>{e.width=4+460*t}))}preload(){this.load.setPath("assets"),this.load.image("logo","logo.png"),this.load.image("gameover","gameover.png"),this.load.image("bad","bad.png"),this.load.image("good","good.png"),this.load.image("keymouse","keymouse.png"),this.load.image("glass","glass.png"),this.load.spritesheet("hit","hit.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("meta","meta.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("blerb","blerb.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("blerb2","blerb2.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("drop","drop.png",{frameWidth:96,frameHeight:96}),this.load.spritesheet("bot1","bot1.png",{frameWidth:128,frameHeight:128}),this.load.spritesheet("mol","mol.png",{frameWidth:512,frameHeight:288})}create(){this.anims.create({key:"hit",frames:this.anims.generateFrameNumbers("hit"),frameRate:30,repeat:0}),this.anims.create({key:"blerb",frames:this.anims.generateFrameNumbers("blerb"),frameRate:10,repeat:-1}),this.anims.create({key:"blerb2",frames:this.anims.generateFrameNumbers("blerb2"),frameRate:10,repeat:-1}),this.anims.create({key:"drop",frames:this.anims.generateFrameNumbers("drop"),frameRate:12,repeat:-1}),this.anims.create({key:"bot1",frames:this.anims.generateFrameNumbers("bot1",{start:0,end:9}),frameRate:10,repeat:-1}),this.anims.create({key:"bot1_die",frames:this.anims.generateFrameNumbers("bot1",{start:10,end:19}),frameRate:20,repeat:0}),this.anims.create({key:"mol",frames:this.anims.generateFrameNumbers("mol"),frameRate:3,repeat:-1}),this.anims.create({key:"meta",frames:this.anims.generateFrameNumbers("meta"),frameRate:30,repeat:-1}),this.scene.start("MainMenu")}}const g={type:Phaser.AUTO,width:1024,height:768,parent:"game-container",backgroundColor:"#000",pixelArt:!1,scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},scene:[i,m,p,d,_]};new s.Game(g);
