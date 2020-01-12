var current_regex = $("#regex").val()
var current_fsm = $("#fsm").val()

function drawGraph(automaton) {
  var dotString = noam.fsm.printDotFormat(automaton);
  var gvizXml = Viz(dotString, "svg");
  $("#automatonGraph").html(gvizXml);
  $("#automatonGraph svg").width($("#automatonGraph").width());
}

$("#generateRegex").click(function() {
  var regex = noam.re.string.random(5, "abcd", {});
  regex = noam.re.string.simplify(regex);
  $("#regex").val(regex);
  $("#regex").focus();
  onRegexChangeDebounced();
});

function generateAutomaton(fsmType) {
  var automaton = noam.fsm.createRandomFsm(fsmType, 3, 2, 2);
  $("#fsm").val(noam.fsm.serializeFsmToString(automaton));
  $("#fsm").scrollTop(0);
  $("#fsm").focus();
  onAutomatonChangeDebounced();
}

$("#generateDFA").click(function() {
  generateAutomaton(noam.fsm.dfaType);
});

$("#generateNFA").click(function() {
  generateAutomaton(noam.fsm.nfaType);
});

$("#generateENFA").click(function() {
  generateAutomaton(noam.fsm.enfaType);
});

function onRegexChange() {
  if (current_regex === $("#regex").val()) {
    return;
  }

  current_regex = $("#regex").val();

  $("#automatonGraph").html("");
  $("#fsm").val("");
  var regex = validateRegex();
  if (regex !== null) {
    var automaton = noam.re.tree.toAutomaton(regex);
    drawGraph(automaton);
    $("#fsm").val(noam.fsm.serializeFsmToString(automaton));
    current_fsm = $("#fsm").val();
  }
}

function onAutomatonChange() {
  if (current_fsm === $("#fsm").val()) {
    return;
  }

  current_fsm = $("#fsm").val();

  $("#automatonGraph").html("");
  $("#regex").val("");
  var automaton = validateFsm();
  if (automaton !== null) {
    drawGraph(automaton);
    automaton = noam.fsm.minimize(automaton);
    var r = noam.fsm.toRegex(automaton);
    r = noam.re.tree.simplify(r, {"useFsmPatterns": false});
    var s = noam.re.tree.toString(r);
    $("#regex").val(s);
    current_regex = $("#regex").val();
  }
}

function validateFsm() {
  var fsm = $("#fsm").val();

  if (fsm.length === 0) {
    $("#fsm").parent().removeClass("success error");
    $("#regex").parent().removeClass("success error");
    $("#inputError").hide();
  } else {
    try {
      fsm = noam.fsm.parseFsmFromString(fsm);
      $("#fsm").parent().removeClass("error");
      $("#fsm").parent().addClass("success");
      $("#regex").parent().removeClass("error");
      $("#regex").parent().addClass("success");
      $("#inputError").hide();
      return fsm;
    } catch (e) {
      $("#fsm").parent().removeClass("success");
      $("#fsm").parent().addClass("error");
      $("#inputError").show();
      $("#inputError").text("Error: " + e.message);
      return null;
    }
  }
}

function validateRegex() {
  var regex = $("#regex").val();

  if (regex.length === 0) {
    $("#regex").parent().removeClass("success error");
    $("#fsm").parent().removeClass("success error");
    $("#inputError").hide();
  } else {
    try {
      regex = noam.re.string.toTree(regex);
      $("#regex").parent().removeClass("error");
      $("#regex").parent().addClass("success");
      $("#fsm").parent().removeClass("error");
      $("#fsm").parent().addClass("success");
      $("#inputError").hide();
      return regex;
    } catch (e) {
      $("#regex").parent().removeClass("success");
      $("#regex").parent().addClass("error");
      $("#inputError").show();
      $("#inputError").text("Error: " + e.message);
      return null;
    }
  }
}

var onRegexChangeDebounced = _.debounce(onRegexChange, 500);
var onAutomatonChangeDebounced = _.debounce(onAutomatonChange, 500)

$("#regex").change(onRegexChangeDebounced);
$("#regex").keyup(onRegexChangeDebounced);
$("#fsm").change(onAutomatonChangeDebounced);
$("#fsm").keyup(onAutomatonChangeDebounced);
