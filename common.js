
var visible = false;

function aboutMe() {
	var about = document.getElementById('about');

	if(visible) {
		about.className = "animated fadeOutRight";
	} else {
		about.style.display = 'block';
		about.className = "animated fadeInRight";
	}

	visible = !visible;

	return false;
}
