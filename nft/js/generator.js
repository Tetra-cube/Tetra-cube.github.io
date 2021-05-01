var faqIsVisible = false, isGeneratingValue = false;

function isValid() {
	return isValidId() && isValidUrl();
}

function isValidId() {
	return $("#id-input").val().length > 0;
}

function isValidUrl() {
	let url = $("#url-input").val();
	return url.length > 0 && urlRegex.test(url);
}

function setButtonValidity() {
	if (isValid()) {
		$("#generate-button").addClass("btn-success");
		$("#generate-button").removeClass("btn-secondary");
	}
	else {
		$("#generate-button").addClass("btn-secondary");
		$("#generate-button").removeClass("btn-success");
	}
}

function generate() {
	if (isGeneratingValue) return;
	if (isValid()) {
		let paramsString = btoa(
			$("#id-input").val().split("").reverse().join("") +
			"|lazy-split|" +
			$("#url-input").val().split("").reverse().join("")
		);
		$("#nft-input").val(window.location.href.replace("generator.html", "nft.html?s=" + paramsString));
		$("#generating-value").css("display", "block");
		$("#your-nft").css("display", "none");
		$("#invalid-id").css("display", "none");
		$("#invalid-url").css("display", "none");
		isGeneratingValue = true;
		setTimeout(() => {
			$("#generating-value").css("display", "none");
			$("#your-nft").css("display", "block");
			$("#nft-value-number").html(getNftValue(paramsString));
			isGeneratingValue = false;
		}, 300);
	}
	else {
		$("#generating-value").css("display", "none");
		$("#your-nft").css("display", "none");
		$("#invalid-id").css("display", isValidId() ? "none" : "block");
		$("#invalid-url").css("display", isValidUrl() ? "none" : "block");
	}
}

function showHideFaq() {
	faqIsVisible = !faqIsVisible;
	if (faqIsVisible) {
		$("#faq").css("display", "block");
		$("#faq-button").text("Hide");
	}
	else {
		$("#faq").css("display", "none");
		$("#faq-button").text("Show");
	}
}

$(document).ready(function () {
	setButtonValidity();
});

// CryptoJS.AES.encrypt(unhashedNft, key).toString()
// CryptoJS.AES.decrypt(hashedNft, key).toString(CryptoJS.enc.Utf8)