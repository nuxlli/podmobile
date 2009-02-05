
function podMobile() {
  //jQuery('body').html(template("main"));
}

jQuery.extend(podMobile.prototype, {
  home_folder: application.pyEval("self.home_dir")
});

var main = new podMobile();
