
var visible = false;

function aboutMe() {
	var about = document.getElementById('about');

	if(visible) {
		about.className = "animated fadeOutRight";
		//about.style.display = 'none';
	} else {
		about.style.display = 'block';
		about.className = "animated fadeInRight";
	}

	visible = !visible;
}
