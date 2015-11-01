
var visible = false;

function aboutMe() {
	var about = document.getElementById('about');

	if(visible) {
		about.className = "animated bounceOut";
	} else {
		about.style.display = 'block';
		about.className = "animated fadeInDown";
	}

	visible = !visible;

	return false;
}
