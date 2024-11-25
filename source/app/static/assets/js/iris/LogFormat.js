
function toggle_auto_detect() {
  //console.log($("#event_desc_content")[0].value);
  let event_desc = $("#event_desc_content")[0].value;

  let type = auto_detect(event_desc);
  console.log("Auto Detect: " + type);
  console.log(event_desc);
  $("#selectEventTypeLogFormat")[0].value = type;
}

function setEventDescription(event_desc) {
  let event_desc_editor = get_new_ace_editor('event_description', 'event_desc_content', 'target_event_desc',
                            function() {
                                $('#last_saved').addClass('btn-danger').removeClass('btn-success');
                                $('#last_saved > i').attr('class', "fa-solid fa-file-circle-exclamation");
                            }, null);
  event_desc_editor.setValue(event_desc);
}

function logFormat() {
  console.log($("#event_desc_content")[0].value);
  let event_desc = $("#event_desc_content")[0].value;
  let event_raw = $("#event_raw")[0].value;

  if (event_raw == "") {
    $("#event_raw")[0].innerHTML = event_desc;
    $("#event_desc_content")[0].innerHTML = "";
  }

  let type = $("#selectEventTypeLogFormat")[0].value

  console.log("Event Type: " + type);
  formatted = format_event(event_desc, type);
  setEventDescription(formatted);
  let time = get_time(event_desc, type)
  time = sanitize_time(time);
  console.log("Time: " + time);
  try_convert_time(time);
}

function format_event(event_desc, type) {
  let formatted = "";
  switch (type) {
    case "win_evtx":
      formatted = format_win_evtx(event_desc);
      break;
    case "velo_evtx":
      formatted = format_velo_evtx(event_desc);
      break;
    case "hayabusa":
      formatted = format_hayabusa(event_desc);
      break;
    default:
      formatted = event_desc;
  }
  console.log(formatted);
  return formatted;
}

function is_json(str) {
  try {
    JSON.parse(str);
  } catch (e) {
    return false;
  }
  return true;
}

function sanitize_time(time_str) {
  time_str = time_str.replace(/\s\+\d\d:\d\d$/, " ");
  return time_str;
}

function auto_detect(event_raw) {
  let type = "unknown";
  let log_type = [{name: "win_evtx", regex: ["\.evtx"], is_json: false}, {name: "velo_evtx", regex:["\.evtx", "EventData"], is_json: true},{name:"hayabusa", regex: ["RuleTitle"], is_json: true}];

  let event_is_json = is_json(event_raw);

  for (let i = 0; i < log_type.length; i++) {
    if (event_is_json == log_type[i].is_json) {
      for (let j = 0; j < log_type[i].regex.length; j++) {
        if (event_raw.search(log_type[i].regex[j]) != -1) {
          type = log_type[i].name;
          break;
        }
      }
    }
  }

  return type;

}


function try_convert_time(time_str) {
  $('#event_date_convert_input').val(time_str);
  time_converter();
}


function format_win_evtx(str) {
  let formatted = "";
  let metas = [...str.matchAll('@Name\"\":\"\"(?P<field_name>[^\"]+)\"\",\"\"#text\"\":\"\"(?P<field_value>[^\"]+)\"\"')];

  for(let meta of metas) {
    formatted += "- " + meta[1] + ": " + meta[2] + "\n";
  }

  return formatted;
}

function format_velo_evtx(str) {
  // parse json
  try {
    let json = JSON.parse(str);
    let formatted = "";
    let event_data = json["EventData"];

    for (let i = 0; i < event_data.length; i++) {
      formatted += "- " + event_data[i]["Name"] + ": " + event_data[i]["Value"] + "\n";
    }
    return formatted;
  }
  catch (e) {
    return str;
  }
}

function format_hayabusa(str) {
  try {
    let json = JSON.parse(str);
    let formatted = "";
    let details = json["Details"];
    let extra = json["ExtraFieldInfo"];
    
    for(let key in details) {
      formatted += "- " + key + ": " + details[key] + "\n";
    }

    for (let key in extra) {
      formatted += "- " + key + ": " + extra[key] + "\n";
    }
    return formatted;
  }
  catch (e) {
    return str;
  }
}

function get_time_hayabusa(event_desc) {
  return JSON.parse(event_desc)["Timestamp"];
}

function get_time_velo_evtx(event_desc) {
  return JSON.parse(event_desc)["TimeCreated"];
}

function get_time_win_evtx(event_desc) {
  return event_desc.split(",")[2];
}

function get_time(event_desc, type) {
  let time = "";
  switch (type) {
    case "win_evtx":
      time = get_time_win_evtx(event_desc);
      break;
    case "velo_evtx":
      time = get_time_velo_evtx(event_desc);
      break;
    case "hayabusa":
      time = get_time_hayabusa(event_desc);
      break;
    default:
      time = "";
  }
  return time;
}