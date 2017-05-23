$(document).ready(function () {  
	
	var isWebkit = navigator.userAgent.indexOf('Chrome') > -1//'WebkitAppearance' in document.documentElement.style
/*	if(isWebkit)
	{
		console.log("WEBKIT")
		$("#kpw-header").addClass("webkit")
	} else {*/
		console.log("GEEN WEBKIT")
		$("#kpw-header").addClass("no-webkit")
//	}
	
	
	
	
	createItems(window.arrKwpItems)
	
});


function createItems($arr) {
	
	console.log($arr)
	
	for(var i = 0; i < $arr.length; i++) {
		
		var slideId = $arr[i].id;
		
		var slideItem = $(document.createElement("div"))
		slideItem.attr("id","kpw-header-item-"+i)
		slideItem.addClass("kpw-header-item")
		slideItem.addClass("disabled")
		
		slideItem.width( (100/$arr.length) +"%")
		
		var per = 1.1
		
			var slideItemPicA = $(document.createElement("div"))
			slideItemPicA.attr("id","kpw-header-item-pic-a-"+i)
			slideItemPicA.addClass("kpw-header-item-pic-a")
			slideItemPicA.addClass("kpw-header-item-pic")
			slideItemPicA.addClass("kpw-header-pic-id-"+slideId+"a")
			
			
				var slideItemPicA_Pic = $(document.createElement("div"))
				slideItemPicA_Pic.addClass("pic")
				slideItemPicA_Pic.css("background-size",$("#kpw-header").width() * per)
				$(slideItemPicA).append(slideItemPicA_Pic)
			
			slideItemPicA.css("background-size",$("#kpw-header").width() * per)
			
			var slideItemPicB = $(document.createElement("div"))
			slideItemPicB.attr("id","kpw-header-item-pic-b-"+i)
			slideItemPicB.addClass("kpw-header-item-pic-b")
			slideItemPicB.addClass("kpw-header-item-pic")
			slideItemPicB.addClass("kpw-header-pic-id-"+slideId+"b")
			
				var slideItemPicB_Pic = $(document.createElement("div"))
				slideItemPicB_Pic.addClass("pic")
				slideItemPicB_Pic.css("background-size",$("#kpw-header").width() * per)
				
		
				
				$(slideItemPicB).append(slideItemPicB_Pic)
			
			slideItemPicB.css("background-size",$("#kpw-header").width() * per)
			
			$(slideItem).append(slideItemPicA)
			$(slideItem).append(slideItemPicB)
			
			
		$("#kpw-header-items").append(slideItem)
		
		
		
		//MENU
		
		var menuItem = $(document.createElement("div"))
		menuItem.attr("id","kpw-menu-item-"+i)
		menuItem.addClass("kpw-menu-item")
		
		if(i == 0) {
			menuItem.addClass("active")
		}
		
		menuItem.text($arr[i].name)
		
		
		
		if(window.boolKpwShowMenu) {
			//$("#kpw-menu-items").hide()
			$("#kpw-menu-items").append(menuItem)
	
	}		
		//Q
		
		var qItem = $(document.createElement("div"))
		qItem.attr("id","kpw-q-item-"+i)
		qItem.addClass("kpw-q-item")
			
		qItem.html("<p><span>"+$arr[i].q +"</span></p>")
		
		slideItem.append(qItem)
		
		
		//A
		
		var aItem = $(document.createElement("div"))
		aItem.attr("id","kpw-a-item-"+i)
		aItem.addClass("kpw-a-item")
			
		aItem.html("<p><span>"+$arr[i].a +"</span></p>")
		
		var aItemButton = $(document.createElement("span"))
		aItemButton.addClass("kpw-button")
		aItemButton.text(window.strKpwCta)
		aItemButton.append("<span></span>")
	
		//aItem.find("p").append(aItemButton)
		
		slideItem.append(aItem)
		
	
	}
	
	
	$("#kpw-header-items").width( ($arr.length*100) +"%")
	
	playItems($arr)
}



var curArray

function playItems($arr) {
	
	curArray = $arr
	
	timeItems($arr)
	
}



var curItem = 0
var curStep = 0
var maxSteps = 5

var curItemNode = 0
var prevItem = 0

var nextItem = 0

function timeItems() {
	
	 setTimeout(timeItems,window.numKpwTiming * 1000);
	
	console.log(numKpwTiming)
	
	//SET CUR ITEM TO STEP
	setClassTo(curItem,"step-"+curStep)
	
	
	
	nextItem = curItem +1
	if(nextItem == curArray.length) {
		nextItem = 0
	}
	
	prevItem = curItem -1
	if(prevItem < 0) {
		prevItem = curArray.length-1
	}
	
	
	/*if(curStep == maxSteps-1) {
		
		//SET NEXT TO 0
		setClassTo(nextItem,"step-"+0)
		
		$(".kpw-menu-item").removeClass("active")
		$("#kpw-menu-item-"+nextItem).addClass("active")
		
	} */
	
	if(curStep == 0 ) {
		
		//SET PREV TO END
		setClassTo(prevItem,"step-end")
		
		$(".kpw-menu-item").removeClass("active")	
		$("#kpw-menu-item-"+curItem).addClass("active")
	}
	
	if(curStep == 1 ) {
		
		//SET PREV TO DISABLED
		setClassTo(prevItem,"disabled")
	}
	
	if(curStep == maxSteps-1) {
		
		curStep = 0
		curItem = nextItem
		
	} else {
		curStep ++
	}
	
	console.log(curStep, maxSteps, "/",curItem,curArray.length,prevItem,nextItem )
	
	
	

	
	
	

}



function setClassTo($targetId, $class){
	
//	console.log("#kpw-header-item-"+$targetId,$class)
	
	var node = $("#kpw-header-item-"+$targetId)
	node.attr('class', 'kpw-header-item');
	node.addClass($class)
	
}
