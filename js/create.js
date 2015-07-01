var set_hour;
var set_minute;
var set_sound;
var set_weather_id;
var weather_pref;
var weather_city;
var registered_date;
var alarm_switch;
var xml_resource;

// READY関数
$(document).ready(function() {
	xmlLoad();
	init();
	$("#send_time").click(function() {
		register();
	});
	$("#alarm_switch").change(function() {
		updateSwitch();
	});
	setInterval("update()", 1000);
});

// 初期化関数
function init() {
	$.ajax({
		url : "http://localhost:8080/time/init"
	});
	$.ajax({
		url : "time.txt",
		success : function(data) {
			var data_array = data.split(/\r\n|\r|\n/);
			setTime(data_array[0], data_array[1]);
			set_sound = data_array[2];
			set_weather_id = data_array[3];
			$("#select_hour").val(set_hour);
			$("#select_minute").val(set_minute);
			$("#select_sound").val(set_sound);
			init_weather_box(set_weather_id);
			$('#reg_time').text("Registered Time " + set_hour + ":" + set_minute);
			$('#alarm_switch').toggleSwitch();
		}
	});
}

// pref,cityのセレクトボックスの初期化
function init_weather_box(weather_id){
	$(xml_resource).find('city').each(function() {
		if($(this).attr('id') == weather_id){
			$("#select_pref").val($(this).parent().attr("title"));
			$(this).parent().find('city').each(function(){
				$('<option value="' + $(this).attr('id') + '">'+ $(this).attr('title') + '</option>').appendTo("#select_city");
			});
			$("#select_city").val($(this).attr('id'));
			weather_city = $(this).attr("title");
			weather_pref = $(this).parent().attr("title");
		}
	});
}

// 1秒毎に呼び出される．アラームスイッチがON AND 時刻が過ぎている場合アラームを鳴らす
function update() {
	$('#reg_region').text("ID="+set_weather_id);
	if (alarm_switch) {
		var now_date = new Date();
		if ((now_date.getHours() == registered_date.getHours())
				&& (now_date.getMinutes() == registered_date.getMinutes())) {
			$.ajax({
				url : "http://localhost:8080/create",
				data : "action="+set_sound+"/"+set_weather_id
			});
			alert("時間です！！");
			set_alarm_switch(false);
		}
	}
}

// 登録ボタンのハンドラ
function register() {
	setTime($("#select_hour").val(), $("#select_minute").val());
	set_sound = $('#select_sound').val();
	date = new Date();
	$.ajax({
		url : "http://localhost:8080/time/register",
		data : {
			hour : set_hour,
			minute : set_minute,
			sound : set_sound,
			weather_id : set_weather_id
		}
	});
	alert(set_hour + '時' + set_minute + '分にサウンドはサウンド' + set_sound + '，天気は'+ weather_pref +" " + weather_city +'で登録しました！'+set_weather_id);
	$('#reg_time').text("Registered Time " + set_hour + ":" + set_minute);
}

// ラジオボタンのハンドラ
function updateSwitch() {
	if ($("#alarm_switch").prop('checked')) {
		alarm_switch = true;
	} else{
		alarm_switch = false;
	}
}

// alarm_switchのセッタ
function set_alarm_switch(flag) {
	alarm_switch = flag;
	// set radio button
	if (alarm_switch) {
		$("#alarm_switch").prop('checked',true);
	} else {
		$("#alarm_switch").prop('checked',false);
	}
}
// hour,minuteのセッタ(同時に時刻を収納)
function setTime(hour, minute) {
	set_hour = hour;
	set_minute = minute;
	var now_date = new Date();
	registered_date = new Date(now_date.getFullYear(), now_date.getMonth(),
			now_date.getDate(), set_hour, set_minute);
}

// XML読み込み
var xmlLoad = function() {
	$.ajax({
		url : 'primary_area.xml',
		type : 'get',
		dataType : 'xml',
		timeout : 1000,
		success : function parse_xml(xml, status) {
			if (status != 'success')
				return;
			$(xml).find('source, ldWeather\\:source').find('pref').each(
					function() {
						$pref = $(this).attr("title");
						$('<option value = ' + $pref + '>' + $pref + '</option>')
								.appendTo("#select_pref");
					});
			xml_resource = $(xml).find('source, ldWeather\\:source');
			xml_resource.each(displayWeather);
		}
	});
}

// 読み込んだXMLを元に，prefを元に対応するcityをセレクトボックスに表示させる
function displayWeather() {
	var resource = $(this);
	$('#select_pref').change(
		function() {
			weather_pref = $('#select_pref').val();

			$('#select_city').empty();
			
			var is_first = true;
			$(resource).find('city').each(function() {
				var pref_title = $(this).parent().attr('title');
				var city_title = $(this).attr("title");
				var city_id = $(this).attr("id");

				if (weather_pref == $(this).parent().attr('title')) {
					$('<option value="' + city_id + '">'+ city_title + '</option>').appendTo("#select_city");
					if(is_first){
						set_weather_id = $('#select_city').val();	//changedが初期値だと受け取れないので，一番上のvalueを代入しておく
						weather_city=$('#select_city option:selected').text();
						is_first = false;
					}
				}
			});
		});
	$('#select_city').change(function(){
		set_weather_id = $(this).val();
		weather_city = $('#select_city option:selected').text();
	});
}