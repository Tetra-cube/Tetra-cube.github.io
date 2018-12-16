const canvasWidth = 400, canvasHeight = 240,
	spriteWidth = 256, spriteHeight = 256,	spriteOff = 28, darkenConst = 0.25,																	// For sprite drawing
	leftX = -27, topY = 146, namePlateMargin = 126, namePlateY = 161, namePlateTextY = 178, talkCursorY = 216, talkCursorMargin = 78,			// For textbox drawing
	dialogue1Y = 202, dialogue2Y = 224, leftTextMargin = 57, rightTextMargin = -159																// For text drawing
	
	allIDs = [ "lp", "rp", "lp2", "rp2" ], leftTextBoxOffsetValues = [0, 0, 4, 8, 12, 16], centerPiecesMax = [0, 12, 12, 11, 11, 10],
	offset = { "lp" : 0, "rp" : canvasWidth - spriteWidth, "lp2" : 0, "rp2" : canvasWidth - spriteWidth },
	flipOffset = { "lp" : -spriteWidth, "rp" : -canvasWidth, "lp2" : -spriteWidth, "rp2" : -canvasWidth };

var ctx, shadingCTX, reader,
	uploadedImages = { "lp" : false, "rp" : false, "lp2" : false, "rp2" : false},
	portraitImages = [], textBoxLeftImages = [], textBoxRightImages = [], textBoxCenterImage, namePlateImage, talkCursorImage, darkenImage, backgroundImage;

// Functions to draw the canvas
var Canvas =
{
	Reload: function()
	{		
		// Draw the content
		ctx.drawImage(backgroundImage, 0, 0, canvasWidth, canvasHeight);
		if($("#darken-bkg").prop("checked"))
			ctx.drawImage(darkenImage, 0, 0, canvasWidth, canvasHeight);
		Canvas.DrawPortrait("lp2");
		Canvas.DrawPortrait("rp2");
		Canvas.DrawPortrait("lp");
		Canvas.DrawPortrait("rp");
		Canvas.DrawTextBox();
	},
	
	// Draw the character sprites
	DrawPortrait: function(id)
	{
		// If the image is blank, ignore all this
		if(!uploadedImages[id]) return;
		
		// Get the spritesheet to use and the location of the image on it
		var image = portraitImages[id],
			index = IDElement(id, "sprite-index").val() - 1,
			sswidth = Math.floor(image.width / spriteWidth),
			spriteColumn = index % sswidth,
			spriteRow = Math.floor(index / sswidth);
		
		// Flip the sprite (if needed) and set the location
		var scale, xPos;
		if(IDElement(id, "flip").prop("checked"))
		{
			scale = -1;
			xPos = flipOffset[id];
		}
		else
		{
			scale = 1;
			xPos = offset[id];
		}
		xPos += ((id == "lp" || id == "rp2") ? -spriteOff : spriteOff) * scale;
		
		// Draw the sprite
		ctx.save();
		ctx.scale(scale, 1);
		ctx.drawImage(image, spriteColumn * spriteWidth, spriteRow * spriteHeight, spriteWidth, spriteHeight, xPos, 0, spriteWidth, spriteHeight);
		if(IDElement(id, "darken").prop("checked"))
			this.DarkenPortrait( { "image" : image, "scale" : scale, "spriteRow" : spriteRow, "spriteColumn" : spriteColumn, "spriteWidth" : spriteWidth, "spriteHeight" : spriteHeight, "xPos" : xPos } );
		ctx.restore();
	},
	
	// Make the character sprites darker
	DarkenPortrait: function(obj)
	{
		// Draw the offscreen canvas
		shadingCTX.save();
		shadingCTX.clearRect(0, 0, canvasWidth, canvasHeight);
		shadingCTX.scale(obj.scale, 1);
		shadingCTX.drawImage(obj.image, obj.spriteColumn * obj.spriteWidth, obj.spriteRow * obj.spriteHeight, obj.spriteWidth, obj.spriteHeight, obj.xPos, 0, obj.spriteWidth, obj.spriteHeight);
		
		// Get pixels from canvas & offscreen canvas
		var imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight),
			pixels = imageData.data,
			offscreenPixels = shadingCTX.getImageData(0, 0, canvasWidth, canvasHeight).data;
		
		// Set the pixels individually (each pixel is 4 indices for rgba)
		for(var i = 0; i < pixels.length; i += 4)
		{
		   var alpha = offscreenPixels[i + 3] * darkenConst / 255;
		   pixels[i] -= offscreenPixels[i] * alpha;
		   pixels[i + 1] -= offscreenPixels[i + 1] * alpha;
		   pixels[i + 2] -= offscreenPixels[i + 2] * alpha;
		}
		// Overlay the shaded image on the canvas
		ctx.putImageData(imageData, 0, 0);
		shadingCTX.restore();
	},
	
	// Draw the textbox
	DrawTextBox: function()
	{
		// If there's no text box just ignore all this
		if(!($("#l-box-radio").prop("checked") || $("#r-box-radio").prop("checked")))
			return;
		
		// Figure out which text box type to use based on radio buttons checked
		var textBoxType;
		for(textBoxType = 1; textBoxType < 6; textBoxType++)
		{
			if($("#type-" + textBoxType + "-radio").prop("checked"))
				break;
		}
		
		// Comput the width of the text and its edge pieces
		var boxEdgeWidth = textBoxLeftImages[textBoxType].width + textBoxRightImages[textBoxType].width,
			boxTextWidth = Math.max(ctx.measureText($("#dialogue-1").val()).width, ctx.measureText($("#dialogue-2").val()).width);
			
		// Compute the number of center pieces (ie. the small image that repeats to make up the middle of the textbox)
		textBoxCenterPieces = Math.floor((boxTextWidth - boxEdgeWidth + 140 - leftTextBoxOffsetValues[textBoxType] * 2) / textBoxCenterImage.width);
		if(textBoxCenterPieces < 1)
			textBoxCenterPieces = 1;
		else if(textBoxCenterPieces > centerPiecesMax[textBoxType])
			textBoxCenterPieces = centerPiecesMax[textBoxType];
		
		// Compute the size and position of the textbox
		var centerWidth = textBoxCenterImage.width * textBoxCenterPieces,
			leftOff = leftX + leftTextBoxOffsetValues[textBoxType],
			alignLeft = $("#l-box-radio").prop("checked"),
			drawX = alignLeft ? leftOff : canvasWidth - leftOff - boxEdgeWidth - centerWidth;
		
		// Get positions of the text and nameplate
		if(alignLeft)
		{
			textX = leftX + leftTextMargin;
			namePlateX = leftOff + namePlateMargin;
		}
		else{
			textX = canvasWidth - centerWidth - leftTextBoxOffsetValues[textBoxType] * 2 + rightTextMargin;
			namePlateX = canvasWidth - leftOff - namePlateMargin;
		}
		
		// Draw the left edge of the box
		ctx.drawImage(textBoxLeftImages[textBoxType], drawX, topY);
		drawX += textBoxLeftImages[textBoxType].width;
		
		// Draw the center of the box
		for(var index = 0; index < textBoxCenterPieces; index++)
		{
			ctx.drawImage(textBoxCenterImage, drawX, topY)
			drawX += textBoxCenterImage.width;
		}
		
		// Draw the right edge of the box
		ctx.drawImage(textBoxRightImages[textBoxType], drawX, topY);
		
		// Draw the text cursor
		ctx.drawImage(talkCursorImage, drawX + leftOff + talkCursorMargin, talkCursorY);
		
		// Draw the text
		ctx.fillStyle = "#4e3d29";
		ctx.textAlign = "left";
		ctx.fillText($("#dialogue-1").val(), textX, dialogue1Y);
		ctx.fillText($("#dialogue-2").val(), textX, dialogue2Y);
		
		// Draw the nameplate
		ctx.drawImage(namePlateImage, namePlateX - Math.floor(namePlateImage.width / 2), namePlateY);
		ctx.fillStyle = "white";
		ctx.textAlign = "center";
		ctx.fillText($("#name").val(), namePlateX, namePlateTextY);
	},
};

// Functions called in the HTML
var HTMLFunctions = 
{
	// New background image
	OnChangeBackground: function(e)
	{
		reader.onload = function(event)
		{
			backgroundImage.src = event.target.result;
		};
		reader.readAsDataURL(e.target.files[0]);
		$("#remove-bkg").show();
		Canvas.Reload();
	},

	// New portrait image
	OnChangePortrait: function(e, id)
	{
		reader.onload = function(event)
		{
			portraitImages[id].src = event.target.result;
			uploadedImages[id] = true;
		};
		reader.readAsDataURL(e.target.files[0]);
		IDElement(id, "remove").show();
		IDElement(id, "sprite-index").val("1");
		IDElement(id, "sprite-index").prop("disabled", false);
		Canvas.Reload();
	},

	// Remove background image
	RemoveBackground: function()
	{
		backgroundImage.src = "feimages/defaultbkg.png";
		$("#remove-bkg").hide();
		$("#bkg").val("");
		Canvas.Reload();
	},

	// Remove portrait image
	RemovePortrait: function(id)
	{
		uploadedImages[id] = false;
		IDElement(id).val(null);
		IDElement(id, "remove").hide();
		IDElement(id, "sprite-index").val("1");
		IDElement(id, "sprite-index").prop("disabled", true);
		Canvas.Reload();
	},

	// Update the darken checkboxes (based on the textbox position)
	UpdateDarkBoxes: function(lr)
	{
		$("#lp-darken").prop("checked", lr == "right");
		$("#rp-darken").prop("checked", lr == "left");
		$("#lp2-darken").prop("checked", lr != "none");
		$("#rp2-darken").prop("checked", lr != "none");
		Canvas.Reload();
	},
}

// Short function to return HTML elements, mostly useful for loops
var IDElement = function(id, name = "")
{
	if(name == "")
		return $("#" + id);
	return $("#" + id + "-" + name);
}

// Initialization function for when the page loads
$(function()
{
	reader = new FileReader();
	
	// Code for portrait images
	for(var idIndex in allIDs)
	{
		portraitImages[allIDs[idIndex]] = new Image();
		portraitImages[allIDs[idIndex]].addEventListener("load", Canvas.Reload);
	}
	
	// Load all the images we want
	for(var index = 1; index < 6; index++)
	{
		var leftImage = new Image(), rightImage = new Image();
		leftImage.src = "feimages/tbox" + index + "L.png";
		rightImage.src = "feimages/tbox" + index + "R.png";
		textBoxLeftImages[index] = leftImage;
		textBoxRightImages[index] = rightImage;
	}
	
	textBoxCenterImage = new Image();
	textBoxCenterImage.src = "feimages/tboxC.png";
	
	backgroundImage = new Image();
	backgroundImage.addEventListener("load", Canvas.Reload);
	backgroundImage.src = "feimages/defaultbkg.png";
	
	darkenImage = new Image();
	darkenImage.addEventListener("load", Canvas.Reload);
	darkenImage.src = "feimages/darken.png";
	
	namePlateImage = new Image();
	namePlateImage.src = "feimages/nameplate.png";
	
	talkCursorImage = new Image();
	talkCursorImage.src = "feimages/talkCursor.png";
	
	// Set up the canvas
	var canvas = $("#image-canvas")[0];
	canvas.width = canvasWidth;
	canvas.height = canvasHeight;
	ctx = canvas.getContext("2d");
	ctx.font = "15px \"Chiaro\"";
	
	// Offscreen canvas used for shading
	var shadingCanvas = document.createElement("canvas");
	shadingCanvas.width = canvasWidth;
	shadingCanvas.height = canvasHeight;
	shadingCTX = shadingCanvas.getContext("2d");
	
	// Reset to defaults
	$("#bkg").val("");
	$("#name").val("");
	$("#dialogue-1").val("");
	$("#dialogue-2").val("");
	$("#darken-bkg").prop("checked", true);
	$("#remove-bkg").hide();
	
	$("#l-box-radio").prop("checked", false);
	$("#r-box-radio").prop("checked", false);
	$("#no-box-radio").prop("checked", true);
	
	$("#type-1-radio").prop("checked", true);
	$("#type-2-radio").prop("checked", false);
	$("#type-3-radio").prop("checked", false);
	$("#type-4-radio").prop("checked", false);
	$("#type-5-radio").prop("checked", false);
	
	$("#lp-flip").prop("checked", true);
	$("#rp-flip").prop("checked", false);
	$("#lp2-flip").prop("checked", true);
	$("#rp2-flip").prop("checked", false);
	
	for(var idIndex in allIDs)
	{
		var id = allIDs[idIndex];
		IDElement(id).val(null);
		IDElement(id, "sprite-index").val("1");
		IDElement(id, "sprite-index").prop("disabled", true);
		IDElement(id, "darken").prop("checked", false);
		IDElement(id, "remove").hide();
	}
	
	// Assign HTML functions to elements
	$("#bkg").on("change", HTMLFunctions.OnChangeBackground);
	$("#remove-bkg").on("click", HTMLFunctions.RemoveBackground);
	
	for(var idIndex in allIDs)
	{
		let id = allIDs[idIndex];
		IDElement(id).on("change", function(e){
			HTMLFunctions.OnChangePortrait(e, id);
		});
		IDElement(id, "remove").on("click", function(){
			HTMLFunctions.RemovePortrait(id);
		});
	}
	
	$("#l-box-radio").on("change", function(){ HTMLFunctions.UpdateDarkBoxes("left"); });
	$("#r-box-radio").on("change", function(){ HTMLFunctions.UpdateDarkBoxes("right"); });
	$("#no-box-radio").on("change", function(){ HTMLFunctions.UpdateDarkBoxes("none"); });
	$("#name, #dialogue-1, #dialogue-2").on("change", Canvas.Reload);
	
	$("#lp-flip, #rp-flip, #lp2-flip, #rp2-flip").on("click", Canvas.Reload);
	$("#lp-sprite-index, #rp-sprite-index, #lp2-sprite-index, #rp2-sprite-index").on("click", Canvas.Reload);
	$("#type-1-radio, #type-2-radio, #type-3-radio, #type-4-radio, #type-5-radio").on("click", Canvas.Reload);
	$("#lp-darken, #rp-darken, #lp2-darken, #rp2-darken, #darken-bkg").on("click", Canvas.Reload);
});