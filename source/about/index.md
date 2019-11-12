---
title: about
date: 2018-10-04 15:20:49
type: "about"
layout: "about"
---


<script type="text/javascript">
function loveTime(){
var sum=new Date()-new Date(2018,9,3,23,3,38)
var d=Math.floor(sum/1000/60/60/24)
var leaveD=sum-d*24*60*60*1000

var h=Math.floor(leaveD/1000/60/60)
var leaveH=sum-(d*24*60*60*1000)-(h*60*60*1000)

var m=Math.floor(leaveH/1000/60)
var leaveM=sum-(d*24*60*60*1000)-(h*60*60*1000)-(m*60*1000)

var s=Math.floor(leaveM/1000)

d=zero(d);
h=zero(h);
m=zero(m);
s=zero(s);

document.getElementById("day").innerHTML=d+"天";
document.getElementById("hour").innerHTML=h+"小时"; 
document.getElementById("minutes").innerHTML=m+"分钟";
document.getElementById("seconds").innerHTML=s+"秒了。"; 
 

}
function zero(i){
if(i<10)  {i="0"+i;}
return i;
}

setInterval("loveTime();",1000);
</script>

<label>
     <p>距离DangoSky的博客诞生已经<strong><i><span id="day"></span><span id="hour"></span></span><span id="minutes"></span><span id="seconds"></span> </strong><i></p>
<label>
<hr>
<p>想要跟我的dango一样，单纯又真诚地诗意栖居，一起看着天空发呆，对着月亮神游。嗯，还要依旧走在你的右手边，左肩有你，右肩微笑。
<p>但生活终究不是只有天空幻想和远方，还有一个现实横刀立马在你通向彼处的路上。不管是为了以后的安稳也好，或是出于自己想变得更加优秀看到更远更靓丽的风景的初衷也罢，一个人总得做些什么事来，总不能辜负这大好时光碌碌无为。所以，依旧保持着这样的热情前行吧，少年。终有一天你还是能够再说出“年轻就是正确”的。嗯，跟以前一样，还是以自由的自我教育意识和那股不器意来遇见更好的自己。
<p>少年的他，喜欢看天悬星河!</p>