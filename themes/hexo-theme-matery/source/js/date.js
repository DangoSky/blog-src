window.onload = function() {
	var Top= document.getElementById("inTop");
	var Bottom= document.getElementById("inBottom");
	var TTop= document.getElementById("weekend");
	
	var date= new Date();
	var year= date.getFullYear();
	var month= date.getMonth() + 1;
	var day= date.getDate();
	var week= date.getDay();
	month = month > 10 ? month : '0' + month;
	day = day > 10 ? day : '0' + day;
	var arr= ["日曜日", "月曜日", "火曜日", "水曜日", "木曜日", "金曜日", "土曜日"];
	TTop.innerHTML= arr[week];
	Top.innerHTML= year + "." + month;
	Bottom.innerHTML= day;
	
	var hour= document.getElementById('hour');
	var minute= document.getElementById("minute");
	var second= document.getElementById("second");
	setInterval(function(){
		var date= new Date();
		var millS= date.getMilliseconds();
		var s= date.getSeconds() + millS/1000;
		var m= date.getMinutes() + s/60;
		var h= date.getHours()%12 + m/60;
		hour.style.transform= 'rotate('+ h*30 +'deg)'; 
		minute.style.transform= 'rotate('+ m*6 +'deg)';
		second.style.transform= 'rotate('+ s*6 +'deg)';
	},10);
}