/**
 * UI utilities.
 */
var UiUtils = {
	
	getProgressBar: function(div) {
		return new ProgressBar.Line(div.get(0), {
			strokeWidth: 2.5,
			color: 'rgb(96, 178, 198)',	// cryptostorage teal
			duration: 0,
			svgStyle: {width: '100%', height: '100%'},
			text: {
				className: 'progresbar-text',
				style: {
					color: 'black',
          position: 'absolute',
          left: '50%',
          top: '50%',
          padding: 0,
          margin: 0,
          transform: {
              prefix: true,
              value: 'translate(-50%, -50%)'
          }
				}
			}
		});
	},
	
	openStorage: function(browserTabName, importedPieces, keyGenConfig, keys, pieces, pieceDivs, confirmExit) {
		
		var dependencies = [
			"lib/jquery-3.2.1.js",
			"lib/jquery-ui.js",
			"lib/loadjs.js",
			"lib/async.js",
			"lib/setImmediate.js",
			"js/BodyExporter.js",
			"js/GenUtils.js",
			"js/DivControllers.js",
			"js/PieceRenderer.js",
			"js/AppUtils.js",
			"js/CryptoPlugins.js",
			"js/CryptoKey.js",
			"js/DependencyLoader.js",
			"lib/jquery-csv.js",
			"lib/qrcode.js",
			"lib/jszip.js",
			"lib/FileSaver.js",
			"lib/crypto-js.js",
			"lib/progressbar.js",
			"lib/pagination.js",
			"lib/bitaddress.js",
			"lib/ua-parser.js",
			"lib/clipboard.js"
		];
		
		// open tab
		newWindow(null, browserTabName, dependencies, ["css/style.css", "css/pagination.css"], getInternalStyleSheetText(), function(window) {
		  window.exportToBody(window, importedPieces, keyGenConfig, keys, pieces, pieceDivs, confirmExit, AppUtils.getCachedEnvironmentInfo());
			window.focus();
		});
	}
}

/**
 * Base class to render and control a div.
 */
function DivController(div) {
	this.div = div;
}
DivController.prototype.getDiv = function() { return this.div; }
DivController.prototype.render = function(onDone) { }	// callback called with rendered div
DivController.prototype.onShow = function() { }
DivController.prototype.onHide = function() { }

/**
 * Controls the entire application.
 * 
 * @param div is the div to render the application to
 */
function AppController(div) {
	
	var that = this;
	var sliderController;
	var sliderDiv;
	var contentDiv;
	var homeController;
	var formController;
	var importController;
	var faqController;
	var donateController;
	
	this.render = function(onDone) {
		div.empty();
		
		// start polling starting with synchronized environment info
		LOADER.load("lib/ua-parser.js", function() {
			AppUtils.pollEnvironment(AppUtils.getEnvironmentInfoSync());
		});
		
		// header
		var headerDiv = $("<div class='app_header'>").appendTo(div);
		
		// header logo
		var headerTopDiv = $("<div class='app_header_top'>").appendTo(headerDiv);
		var logo = $("<img class='app_header_logo_img' src='img/cryptostorage_white.png'>").appendTo(headerTopDiv);
		logo.click(function() {
			window.location.href = "#home";
			that.showHome();
		});
		
		// header links
		var linksDiv = $("<div class='app_header_links_div'>").appendTo(headerTopDiv);
		var homeLink = getLinkDiv("Home");
		homeLink.click(function() {
			window.location.href = "#home";
			that.showHome();
		});
		var gitHubLink = $("<a target='_blank' class='link_div' href='https://github.com/cryptostorage/cryptostorage.com'>GitHub</a>");
		var faqLink = getLinkDiv("FAQ");
		faqLink.click(function() {
			window.location.href = "#faq";
			that.showFaq();
		});
		var donateLink = getLinkDiv("Donate");
		donateLink.click(function() {
			window.location.href = "#donate";
			that.showDonate();
		});
		linksDiv.append(homeLink);
		linksDiv.append(gitHubLink);
		linksDiv.append(faqLink);
		linksDiv.append(donateLink);
		
		function getLinkDiv(label) {
			var div = $("<div class='link_div'>");
			div.html(label);
			return div;
		}
		
		// slider
		sliderDiv = $("<div>").appendTo(headerDiv);
		sliderController = new SliderController(sliderDiv, onSelectGenerate, onSelectImport);
		
		// main content
		contentDiv = $("<div class='app_content'>").appendTo(div);
		
		// initialize controllers
		homeController = new HomeController($("<div>"));
		formController = new FormController($("<div>"));
		importController = new ImportController($("<div>"));
		importController.render();
		faqController = new FaqController($("<div>"));
		faqController.render();
		donateController = new DonateController($("<div>"));
		donateController.render();
		
		// timeout fixes issue on safari where cryptostorage logo doesn't reliably show
		setImmediate(function() {
			
			// get identifier
			var href = window.location.href;
			var lastIdx = href.lastIndexOf("#");
			var identifier = lastIdx === -1 ? null : href.substring(lastIdx + 1);
			
			// show page based on identifier
			if (identifier === "home") that.showHome();
			else if (identifier === "faq") that.showFaq();
			else if (identifier === "donate") that.showDonate();
			else that.showHome();
			
			// done rendering
			if (onDone) onDone(div);
		});
	}
	
	this.showHome = function() {
		if (AppUtils.DEV_MODE) console.log("showHome()");
		sliderDiv.show();
		sliderController.render(function() {
			homeController.render(function(div) {
				setContentDiv(div);
			});
		});
	}
	
	this.showForm = function(onDone) {
		if (AppUtils.DEV_MODE) console.log("showForm()");
		formController.render(function(div) {
			setContentDiv(div);
			sliderDiv.hide();
			if (onDone) onDone();
		});
	}
	
	this.showFaq = function() {
		if (AppUtils.DEV_MODE) console.log("showFaq()");
		sliderDiv.hide();
		setContentDiv(faqController.getDiv());
	}
	
	this.showDonate = function() {
		if (AppUtils.DEV_MODE) console.log("showDonate()");
		sliderDiv.hide();
		setContentDiv(donateController.getDiv());
	}
	
	this.showImport = function() {
		if (AppUtils.DEV_MODE) console.log("showImport()");
		sliderDiv.hide();
		setContentDiv(importController.getDiv());
	}
	
	// ---------------------------------- PRIVATE -------------------------------
	
	function setContentDiv(div) {
		while (contentDiv.get(0).hasChildNodes()) {
			contentDiv.get(0).removeChild(contentDiv.get(0).lastChild);
		}
		contentDiv.append(div);
	}
	
	function onSelectGenerate() {
		that.showForm();
	}
	
	function onSelectImport() {
		that.showImport();
	}
}
inheritsFrom(AppController, DivController);

/**
 * Slider main features.
 */
function SliderController(div, onSelectGenerate, onSelectImport) {
	DivController.call(this, div);
	this.render = function(onDone) {
		div.empty();
		div.attr("class", "intro_div");
		
		// load mix img
		var mixImg = new Image();
		mixImg.onload = function() {
			
			// intro slider
			var sliderContainerDiv = $("<div class='slider_container'>").appendTo(div);
			var sliderDiv = $("<div class='single-item'>").appendTo(sliderContainerDiv);
			getSlide($(mixImg), "Create cold storage and paper wallets for multiple cryptocurrencies.").appendTo(sliderDiv);
			getSlide($("<img src='img/printer.png'>"), "Print or download for long term storage and easy recovery.").appendTo(sliderDiv);
			getSlide($("<img src='img/security.png'>"), "Runs only in your browser so funds are never entrusted to a third party.").appendTo(sliderDiv);
			getSlide($("<img src='img/search_file.png'>"), "100% open source and free to use.  No account necessary.").appendTo(sliderDiv);
			getSlide($("<img src='img/passphrase_protected.png'>"), "Private keys can be passphrase protected and split into pieces for maximum security.").appendTo(sliderDiv);
			getSlide($("<img src='img/traffic_light.png'>"), "Environment checks help generate keys securely.").appendTo(sliderDiv);
			sliderDiv.slick({autoplay:true, arrows:false, dots:true, pauseOnHover:false, autoplaySpeed:AppUtils.SLIDER_RATE});
			
			function getSlide(img, text) {
				var slide = $("<div class='slide'>");
				var slideContent = $("<div class='slide_content'>").appendTo(slide);
				if (img) {
					var imgDiv = $("<div>").appendTo(slideContent);
					img.appendTo(imgDiv);
					img.attr("class", "slide_img");
				}
				var labelDiv = $("<div class='slide_label'>").appendTo(slideContent);
				labelDiv.html(text);
				return slide;
			}
			
			// call to action is overlaid
			var ctaDiv = $("<div class='cta_div'>").appendTo(div);
			
			// button to generate keys
			var btnGenerate = $("<div class='btn home_generate_btn'>").appendTo(ctaDiv);
			btnGenerate.append("Generate New Keys");
			btnGenerate.click(function() { onSelectGenerate(); });
			
			// button to import keys
			var btnImport = $("<div class='btn btn_import'>").appendTo(ctaDiv);
			btnImport.append("or Import Existing Keys");
			
			// disable import keys if failed environment check
			AppUtils.addEnvironmentListener(function(info) {
				btnImport.unbind("click");
				if (!AppUtils.hasEnvironmentFailure(info)) btnImport.click(function() { onSelectImport(); });
			});
			
			if (onDone) onDone(div);
		}
		mixImg.src = "img/mix.png";
	}
}
inheritsFrom(SliderController, DivController);

/**
 * Home page content.
 * 
 * @param div is the div to render to
 */
function HomeController(div) {
	DivController.call(this, div);
	this.render = function(onDone) {
		
		// div setup
		div.empty();
		div.attr("class", "content_div");
		
		// notice div
		var noticeDiv = $("<div>").appendTo(div);
		new NoticeController(noticeDiv, {showOnWarn: false, showOnPass: false}).render();
		
		// home content
		var pageDiv = $("<div class='page_div home_div vertical_flex'>").appendTo(div);
		
		// supported currencies
		pageDiv.append("<div class='home_label'>Supports these cryptocurrencies</div>");
		var plugins = AppUtils.getCryptoPlugins();
		pageDiv.append(getCurrencyRow(plugins.slice(0, 3), true, onCurrencyClicked));
		var moreDiv = null;
		for (var i = 3; i < plugins.length; i += 4) {
			var row = getCurrencyRow(plugins.slice(i, i + 4), false, onCurrencyClicked);
			if (i >= 7 && !moreDiv) {
				moreDiv = $("<div>").appendTo(pageDiv);
				moreDiv.hide();
			}
			if (moreDiv) moreDiv.append(row);
			else pageDiv.append(row);
		}
		
		// add more div
		if (moreDiv) {
			var moreLabel = $("<div class='home_more_label'>").appendTo(pageDiv);
			moreLabel.append("and " + (plugins.length - 7) + " more...");
			moreLabel.click(function() {
				moreLabel.hide();
				moreDiv.show();
			});
		}
		
		// sample page
		$("<div style='height:100px'>").appendTo(pageDiv);
		pageDiv.append("<div class='home_label'>Export to printable and digital format for long term storage</div>");
		$("<div style='height:40px'>").appendTo(pageDiv);
		pageDiv.append($("<img width=750px src='img/print_sample.png'>"));
		
		// track environment failure to disable clicking currency
		var environmentFailure = false;
		AppUtils.addEnvironmentListener(function(info) {
			environmentFailure = AppUtils.hasEnvironmentFailure(info);
		});
		
		function onCurrencyClicked(plugin) {
			if (!environmentFailure) UiUtils.openStorage(plugin.getName() + " Storage", null, getKeyGenConfig(plugin), null, null, null, true); 
		}
		
		function getKeyGenConfig(plugin) {
			var config = {};
			config.passphraseEnabled = false;
			config.splitEnabled = false;
			config.numPieces = 1;
			config.minPieces = null;
			config.currencies = [];
			config.currencies.push({
				ticker: plugin.getTicker(),
				numKeys: 1,
				encryption: null
			});
			return config;
		}
		
		if (onDone) onDone(div);
	}
	
	function getCurrencyRow(plugins, isMajor, onCurrencyClicked) {
		var row = $("<div class='currency_row'>");
		for (var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			var item = $("<div>").appendTo(row);
			item.attr("class", isMajor ? "currency_row_item_major" : "currency_row_item_minor");
			item.click(currencyClickFunc(plugin));
			var img = $("<img src='" + plugin.getLogo().get(0).src + "'>").appendTo(item);
			img.attr("class", isMajor ? "currency_row_logo_major" : "currency_row_logo_minor");
			img.append(plugin.getLogo());
			var label = $("<div>").appendTo(item);
			label.attr("class", isMajor ? "currency_row_label_major" : "currency_row_label_minor");
			label.html(plugin.getName());
		}
		return row;
		
		function currencyClickFunc(plugin) {
			return function() { onCurrencyClicked(plugin); }
		}
	}
}
inheritsFrom(HomeController, DivController);

/**
 * FAQ page.
 */
function FaqController(div) {
	DivController.call(this, div);
	this.render = function(onDone) {
		
		// div setup
		div.empty();
		div.attr("class", "content_div");
		var pageDiv = $("<div class='page_div'>").appendTo(div);
		
		// title
		var titleDiv = $("<div class='title'>").appendTo(pageDiv);
		titleDiv.html("Frequently Asked Questions");
		
		// questions and answers
		$("<div class='question'>").html("What is cryptostorage.com?").appendTo(pageDiv);
		$("<div class='answer'>").html("Cryptostorage.com is an open source application to generate public/private key pairs for multiple cryptocurrencies.  This site runs only in your device's browser.").appendTo(pageDiv);
		$("<div class='question'>").html("How should I use cryptostorage.com to generate secure storage for my cryptocurrencies?").appendTo(pageDiv);
		$("<div class='answer'>").html("<ol><li>Download the source code and its signature file to a flash drive.</li><li>Verify the source code has not been tampered with: TODO</li><li>Test before using by sending a small transaction and verifying that funds can be imported from the private key.</li></ol>").appendTo(pageDiv);
		$("<div class='question'>").html("How can I trust this service?").appendTo(pageDiv);
		$("<div class='answer'>").html("Cryptostorage.com is 100% open source and verifiable.  Downloading and verifying the source code will ensure the source code matches what is publicly audited.  See \"How do I generate secure storage using cryptostorage.com?\" for instructions to download and verify the source code.").appendTo(pageDiv);
		$("<div class='question'>").html("Do I need internet access to import my private keys?").appendTo(pageDiv);
		$("<div class='answer'>").html("No.  The source code is everything you need to import the private keys.  Users should save a copy of this site for future use so there is no dependence on third parties to access this software.  Further, the source code for this site is hosted on GitHub.com. (TODO)").appendTo(pageDiv);
		$("<div class='question'>").html("Can I send funds from private keys using cryptostorage.com?").appendTo(pageDiv);
		$("<div class='answer'>").html("Not currently.  Cryptostorage.com is a public/private key generation and importy service.  It is expected that users will import private keys into the wallet software of their choice after keys have been imported using crypstorage.com.  Support to send funds from cryptostorage.com may be considered in the future.").appendTo(pageDiv);
		$("<div class='question'>").html("What formats can I export to?").appendTo(pageDiv);
		$("<div class='answer'>").html("TODO").appendTo(pageDiv);
		
		// done rendering
		if (onDone) onDone(div);
	}
}
inheritsFrom(FaqController, DivController);

/**
 * Donate page.
 */
function DonateController(div, appController) {
	DivController.call(this, div);
	
	this.render = function(onDone) {
		
		// div setup
		div.empty();
		div.attr("class", "content_div");
		var pageDiv = $("<div class='page_div'>").appendTo(div);
		
		// load qr code dependency
		LOADER.load(["lib/qrcode.js", "lib/async.js", "lib/clipboard.js"], function() {
			
			// build donate section
			var titleDiv = $("<div class='title'>").appendTo(pageDiv);
			titleDiv.html("Donate");
			var donations = [];
			var plugins = AppUtils.getCryptoPlugins();
			for (var i = 0; i < plugins.length; i++) {
				var plugin = plugins[i];
				donations.push({
					logo: plugin.getLogo(),
					label: plugin.getName(),
					address: plugin.getDonationAddress()
				});
			}
			renderDonationAddresses(donations, function(donationsDiv) {
				pageDiv.append(donationsDiv);
				
				// build credits section
				pageDiv.append("<br><br>");
				titleDiv = $("<div class='title'>").appendTo(pageDiv);
				titleDiv.html("Credits");
				var credits = [];
				credits.push({
					logo: AppUtils.getCryptoPlugin("ETH").getLogo(),
					label: "UI design",
					labelUrl: null,
					address: "0x5735bb7cec965e58d03dddd167d1f27321878c51"
				});
				credits.push({
					logo: AppUtils.getCryptoPlugin("BTC").getLogo(),
					label: "bitaddress.org",
					labelUrl: "https://bitaddress.org",
					address: "1NiNja1bUmhSoTXozBRBEtR8LeF9TGbZBN"
				});
				credits.push({
					logo: AppUtils.getCryptoPlugin("XMR").getLogo(),
					label: "moneroaddress.org",
					labelUrl: "https://moneroaddress.org",
					address: "4AfUP827TeRZ1cck3tZThgZbRCEwBrpcJTkA1LCiyFVuMH4b5y59bKMZHGb9y58K3gSjWDCBsB4RkGsGDhsmMG5R2qmbLeW"
				});
				renderDonationAddresses(credits, function(donationsDiv) {
					pageDiv.append(donationsDiv);
					
					// make addresses copyable
					new Clipboard(".copyable", {
						text: function(trigger) {
							return $(trigger).html();
						}
					});
					
					if (onDone) onDone(div);
				});
			});
		});
		
		/**
		 * Renders the given donations.
		 * 
		 * @param donations are [{logo: <logo>, label: <label>, value: <value>}, ...].
		 * @param onDone(div) is invoked when done
		 */
		function renderDonationAddresses(donations, onDone) {
			
			// div to render to
			var donationsDiv = $("<div>");
			
			// collect functions to render values
			var left = true;
			var funcs = [];
			for (var i = 0; i < donations.length; i++) {
				var donation = donations[i];
				var donationDiv = $("<div>").appendTo(donationsDiv); 
				if (left) {
					funcs.push(renderLeftFunc(donationDiv, donation));
				} else {
					funcs.push(renderRightFunc(donationDiv, donation));
				}
				left = !left;
			}
			
			function renderLeftFunc(donationDiv, donation) {
				return function(onDone) { renderLeft(donationDiv, donation, onDone); }
			}
			
			function renderRightFunc(donationDiv, donation) {
				return function(onDone) { renderRight(donationDiv, donation, onDone); }
			}
			
			// render addresses in parallel
			async.parallel(funcs, function(err, results) {
				if (err) throw err;
				onDone(donationsDiv);
			});
		}
		
		function renderLeft(div, donation, onDone) {
			div.attr("class", "donate_left");
			var qrDiv = $("<div>").appendTo(div);
			var labelAddressDiv = $("<div class='donate_label_address'>").appendTo(div);
			var logoLabelDiv = $("<div class='donate_left_logo_label'>").appendTo(labelAddressDiv);
			var logo = $("<img src='" + donation.logo.get(0).src + "'>").appendTo(logoLabelDiv);
			logo.attr("class", "donate_logo");
			var labelDiv = $("<div class='donate_label'>").appendTo(logoLabelDiv);
			if (donation.labelUrl) {
				labelDiv.append($("<a target='_blank' href='" + donation.labelUrl + "'>" + donation.label + "</a>"));
			} else {
				labelDiv.append(donation.label);
			}
			var addressDiv = $("<div class='donate_left_address copyable'>").appendTo(labelAddressDiv);
			addressDiv.append(donation.address);
			
			// render qr code
			try {
				AppUtils.renderQrCode(donation.address, null, function(img) {
					img.attr("class", "donate_left_qr");
					qrDiv.append(img);
					onDone();
				});
			} catch (err) {
				console.log("Could not render QR code");
				onDone();
			}
		}
		
		function renderRight(div, donation, onDone) {
			div.attr("class", "donate_right");
			var labelAddressDiv = $("<div class='donate_label_address'>").appendTo(div);
			var logoLabelDiv = $("<div class='donate_right_logo_label'>").appendTo(labelAddressDiv);
			var logo = $("<img src='" + donation.logo.get(0).src + "'>").appendTo(logoLabelDiv);
			logo.attr("class", "donate_logo");
			var labelDiv = $("<div class='donate_label'>").appendTo(logoLabelDiv);
			if (donation.labelUrl) {
				labelDiv.append($("<a target='_blank' href='" + donation.labelUrl + "'>" + donation.label + "</a>"));
			} else {
				labelDiv.append(donation.label);
			}
			var addressDiv = $("<div class='donate_right_address copyable'>").appendTo(labelAddressDiv);
			addressDiv.append(donation.address);
			var qrDiv = $("<div>").appendTo(div);
			
			// render qr code
			try {
				AppUtils.renderQrCode(donation.address, null, function(img) {
					img.attr("class", "donate_right_qr");
					qrDiv.append(img);
					onDone();
				});
			} catch (err) {
				console.log("Could not render QR code");
				onDone();
			}
		}
	}
}
inheritsFrom(DonateController, DivController);

/**
 * Form page.
 */
function FormController(div) {
	DivController.call(this, div);
	
	var currencyInputsDiv;
	var currencyInputs;			// tracks each currency input
	var passphraseCheckbox;
	var passphraseInputDiv;
	var passphraseInput;
	var bip38CheckboxDiv;
	var bip38Checkbox;
	var showPassphraseCheckbox;
	var splitCheckbox;
	var splitInputDiv;
	var numPiecesInput;
	var minPiecesInput;
	var	btnGenerate;
	var formErrors = {};
	var plugins = AppUtils.getCryptoPlugins();
	
	this.render = function(onDone) {
		div.empty();
		div.attr("class", "content_div");
		
		// notice div
		var noticeDiv = $("<div>").appendTo(div);
		new NoticeController(noticeDiv).render();
		
		// page div
		var pageDiv = $("<div class='page_div'>").appendTo(div);
		
		// top links
		var formLinks = $("<div class='form_links_div'>").appendTo(pageDiv);
		var oneOfEachLink = $("<div class='form_link'>").appendTo(formLinks);
		oneOfEachLink.html("One of each");
		oneOfEachLink.click(function() { onOneOfEach(); });
		
		// currency inputs
		currencyInputs = [];
		var currencyDiv = $("<div class='form_section_div'>").appendTo(pageDiv);
		currencyInputsDiv = $("<div class='currency_inputs_div'>").appendTo(currencyDiv);
		
		// link to add currency
		var addCurrencyDiv = $("<div class='add_currency_div'>").appendTo(currencyDiv);
		var addCurrencySpan = $("<span class='add_currency_span'>").appendTo(addCurrencyDiv);
		addCurrencySpan.html("+ Add another currency");
		addCurrencySpan.click(function() {
			addCurrency();
		});
		
		// passphrase checkbox
		var passphraseDiv = $("<div class='form_section_div'>").appendTo(pageDiv);
		var passphraseCheckboxDiv = $("<div class='horizontal_flex'>").appendTo(passphraseDiv);
		passphraseCheckbox = $("<input type='checkbox' id='passphrase_checkbox'>").appendTo(passphraseCheckboxDiv);
		var passphraseCheckboxLabel = $("<label for='passphrase_checkbox'>").appendTo(passphraseCheckboxDiv);
		passphraseCheckboxLabel.html("Do you want to protect your private keys with a passphrase?");
		passphraseCheckbox.click(function() {
			if (passphraseCheckbox.prop('checked')) {
				passphraseInputDiv.show();
				passphraseInput.focus();
			} else {
				passphraseInputDiv.hide();
				validatePassphrase(true);
			}
		});
		
		// passphrase input
		passphraseInputDiv = $("<div class='passphrase_input_div'>").appendTo(passphraseDiv);
		var passphraseWarnDiv = $("<div class='passphrase_warn_div'>").appendTo(passphraseInputDiv);
		passphraseWarnDiv.append("This passphrase is required to access funds later on.  Don’t lose it!");
		passphraseInputDiv.append("Passphrase");
		passphraseInput = $("<input type='password' class='passphrase_input'>").appendTo(passphraseInputDiv);
		passphraseInput.on("input focusout", function(e) {
			passphraseInput.removeClass("form_input_error_div");
			formErrors.passphrase = false;
			updateForm();
		});
		
		// passphrase config
		var passphraseConfigDiv = $("<div class='passphrase_config_div'>").appendTo(passphraseInputDiv);
		bip38CheckboxDiv = $("<div class='bip38_checkbox_div'>").appendTo(passphraseConfigDiv);
		bip38Checkbox = $("<input type='checkbox' id='bip38_checkbox'>").appendTo(bip38CheckboxDiv);
		var bip38CheckboxLabel = $("<label for='bip38_checkbox'>").appendTo(bip38CheckboxDiv);
		bip38CheckboxLabel.html("Use BIP38 for Bitcoin and Bitcoin Cash");
		var showPassphraseCheckboxDiv = $("<div class='show_passphrase_checkbox_div'>").appendTo(passphraseConfigDiv);
		showPassphraseCheckbox = $("<input type='checkbox' id='show_passphrase'>").appendTo(showPassphraseCheckboxDiv);
		var showPassphraseCheckboxLabel = $("<label for='show_passphrase'>").appendTo(showPassphraseCheckboxDiv);
		showPassphraseCheckboxLabel.html("Show passphrase");
		showPassphraseCheckbox.click(function() {
			if (showPassphraseCheckbox.prop('checked')) {
				passphraseInput.attr("type", "text");
			} else {
				passphraseInput.attr("type", "password");
			}
		});
		
		// split checkbox
		var splitDiv = $("<div class='form_section_div'>").appendTo(pageDiv);
		var splitCheckboxDiv = $("<div class='horizontal_flex'>").appendTo(splitDiv);
		splitCheckbox = $("<input type='checkbox' id='split_checkbox'>").appendTo(splitCheckboxDiv);
		var splitCheckboxLabel = $("<label for='split_checkbox'>").appendTo(splitCheckboxDiv);
		splitCheckboxLabel.html("Do you want to split your private keys into separate pieces?");
		splitCheckbox.click(function() {
			if (splitCheckbox.prop('checked')) {
				splitInputDiv.show();
				validateSplit(true, true);
			} else {
				splitInputDiv.hide();
				validateSplit(true, false);
			}
		});
		
		// split input
		splitInputDiv = $("<div class='split_input_div'>").appendTo(splitDiv);
		var splitQr = $("<img class='split_qr' src='img/qr_code.png'>").appendTo(splitInputDiv);
		var splitLines3 = $("<img class='split_lines_3' src='img/split_lines_3.png'>").appendTo(splitInputDiv);
		var splitNumDiv = $("<div class='split_num_div'>").appendTo(splitInputDiv);
		var splitNumLabelTop = $("<div class='split_num_label_top'>").appendTo(splitNumDiv);
		splitNumLabelTop.html("Split Each Key Into");
		numPiecesInput = $("<input type='tel' value='3' min='2'>").appendTo(splitNumDiv);
		var splitNumLabelBottom = $("<div class='split_num_label_bottom'>").appendTo(splitNumDiv);
		splitNumLabelBottom.html("Pieces");
		var splitLines2 = $("<img class='split_lines_2' src='img/split_lines_2.png'>").appendTo(splitInputDiv);
		var splitMinDiv = $("<div class='split_min_div'>").appendTo(splitInputDiv);
		var splitMinLabelTop = $("<div class='split_min_label_top'>").appendTo(splitMinDiv);
		splitMinLabelTop.html("Require");
		minPiecesInput = $("<input type='tel' value='2' min='2'>").appendTo(splitMinDiv);
		var splitMinLabelBottom = $("<div class='split_min_label_bottom'>").appendTo(splitMinDiv);
		splitMinLabelBottom.html("To Recover");	
		numPiecesInput.on("input", function(e) { validateSplit(true, false); });
		numPiecesInput.on("focusout", function(e) { validateSplit(true, true); });
		minPiecesInput.on("input", function(e) { validateSplit(true, false); });
		minPiecesInput.on("focusout", function(e) { validateSplit(true, true); });
		
		// apply default configuration
		passphraseCheckbox.prop('checked', false);
		passphraseInputDiv.hide();
		showPassphraseCheckbox.prop('checked', false);
		splitCheckbox.prop('checked', false);
		splitInputDiv.hide();
		
		// add generate button
		var generateDiv = $("<div class='form_generate_div'>").appendTo(pageDiv);
		btnGenerate = $("<div class='form_generate_btn'>").appendTo(generateDiv);
		btnGenerate.append("Generate Keys");
		
		// start over
		var startOverLink = $("<div class='form_start_over'>").appendTo(pageDiv);
		startOverLink.html("Or start over")
		startOverLink.click(function() { onStartOver(); });
		
		// disable generate button if environment failure
		AppUtils.addEnvironmentListener(function(info) {
			formErrors.environment = AppUtils.hasEnvironmentFailure(AppUtils.getCachedEnvironmentInfo());
			updateForm()
		});
		
		// add first currency
		addCurrency();
		
		// done rendering
		if (onDone) onDone(div);
	}
	
	// -------------------------------- PRIVATE ---------------------------------
	
	function onStartOver() {
		
		// reset currencies
		for (var i = 0; i < currencyInputs.length; i++) {
			currencyInputs[i].getDiv().remove();
		}
		currencyInputs = [];
		addCurrency();
		
		// reset passphrase
		passphraseCheckbox.prop('checked', false);
		passphraseInputDiv.hide();
		showPassphraseCheckbox.prop('checked', false);
		passphraseInput.val("");
		bip38Checkbox.prop('checked', false);
		
		// reset split
		splitCheckbox.prop('checked', false);
		splitInputDiv.hide();
		numPiecesInput.val(3);
		minPiecesInput.val(2);
		
		// update form
		validateForm(true);
	}
	
	// handle when generate button clicked
	function onGenerate(onDone) {
		validateForm(true);
		if (!hasFormErrors()) UiUtils.openStorage("Export Storage", null, getConfig(), null, null, null, true);
		if (onDone) onDone();
	}
	
	// get current form configuration
	function getConfig() {
		var config = {};
		config.passphraseEnabled = passphraseCheckbox.prop('checked');
		config.passphrase = passphraseInput.val();
		config.splitEnabled = splitCheckbox.prop('checked');
		config.numPieces = config.splitEnabled ? parseFloat(numPiecesInput.val()) : 1;
		config.minPieces = config.splitEnabled ? parseFloat(minPiecesInput.val()) : null;
		config.verifyEncryption = AppUtils.VERIFY_ENCRYPTION;
		config.currencies = [];
		for (var i = 0; i < currencyInputs.length; i++) {
			var currencyInput = currencyInputs[i];
			config.currencies.push({
				ticker: currencyInput.getSelectedPlugin().getTicker(),
				numKeys: currencyInput.getNumKeys(),
				encryption: config.passphraseEnabled ? getEncryptionScheme(currencyInput) : null
			});
		}
		verifyConfig(config);
		return config;
		
		function getEncryptionScheme(currencyInput) {
			if (currencyInput.getSelectedPlugin().getTicker() === "BTC" && bip38Checkbox.prop('checked')) return AppUtils.EncryptionScheme.BIP38;
			if (currencyInput.getSelectedPlugin().getTicker() === "BCH" && bip38Checkbox.prop('checked')) return AppUtils.EncryptionScheme.BIP38;
			return AppUtils.EncryptionScheme.CRYPTOJS;
		}
		
		function verifyConfig(config) {
			assertDefined(config.verifyEncryption);
			for (var i = 0; i < config.currencies.length; i++) {
				var currency = config.currencies[i];
				assertDefined(currency.ticker);
				assertDefined(currency.numKeys);
				assertDefined(currency.encryption);
			}
		}
	}
	
	function addCurrency(defaultTicker) {
		if (AppUtils.DEV_MODE) console.log("addCurrency()");
		
		// create input
		var currencyInput = new CurrencyInput($("<div>"), currencyInputs.length, plugins, defaultTicker, updateForm, function() {
			removeCurrency(currencyInput);
		}, function(isValid) {
			validateCurrencyInputs();
			updateForm();
		});
		
		// update currency inputs and add to page
		currencyInputs.push(currencyInput);
		currencyInputs[0].setTrashEnabled(currencyInputs.length !== 1);
		currencyInput.getDiv().appendTo(currencyInputsDiv);
		updateForm();
	}
	
	function removeCurrency(currencyInput) {
		var idx = currencyInputs.indexOf(currencyInput);
		if (idx < 0) throw new Error("Could not find currency input");
		currencyInputs.splice(idx, 1);
		currencyInputs[0].setTrashEnabled(currencyInputs.length !== 1);
		currencyInput.getDiv().remove();
		validateCurrencyInputs(true);
	}
	
	function onOneOfEach() {
		
		// remove existing currencies
		for (var i = 0; i < currencyInputs.length; i++) {
			currencyInputs[i].getDiv().remove();
		}
		currencyInputs = [];
		
		// add one input per currency
		for (var i = 0; i < plugins.length; i++) {
			addCurrency(plugins[i].getTicker());
		}
		validateCurrencyInputs();
		updateForm();
	}
	
	function updateForm() {
		
		// determine if BTC is selected
		var btcFound = false;
		for (var i = 0; i < currencyInputs.length; i++) {
			var currencyInput = currencyInputs[i];
			if (currencyInput.getSelectedPlugin().getTicker() === "BTC") {
				btcFound = true;
				break;
			}
		}
		
		// determine if BCH is selected
		var bchFound = false;
		for (var i = 0; i < currencyInputs.length; i++) {
			var currencyInput = currencyInputs[i];
			if (currencyInput.getSelectedPlugin().getTicker() === "BCH") {
				bchFound = true;
				break;
			}
		}
		
		// show or hide bip38 checkbox
		btcFound || bchFound ? bip38CheckboxDiv.show() : bip38CheckboxDiv.hide();
		
		// update generate button
		setGenerateEnabled(!hasFormErrors());
		
		// focus passphrase if error
		if (formErrors.passphrase) passphraseInput.focus();
	}
	
	function hasFormErrors() {
		return formErrors.environment || formErrors.currencyInputs || formErrors.passphrase || formErrors.split;
	}
	
	function validateForm(_updateForm) {
		validateCurrencyInputs(false);
		validatePassphrase(false);
		validateSplit(false, true);
		if (_updateForm) updateForm();
	}
	
	function validateCurrencyInputs(_updateForm) {
		var err = null;
		for (var i = 0; i < currencyInputs.length; i++) {
			if (!currencyInputs[i].isValid()) err = true;
		}
		formErrors.currencyInputs = err;
		if (_updateForm) updateForm();
	}
	
	function validatePassphrase(_updateForm) {
		
		// handle passphrase not checked
		if (!passphraseCheckbox.is(":checked")) {
			formErrors.passphrase = false;
			passphraseInput.removeClass("form_input_error_div");
		}
		
		// handle passphrase checked
		else {
			var passphrase = passphraseInput.val();
			if (!passphrase || passphrase.length < AppUtils.MIN_PASSWORD_LENGTH) {
				formErrors.passphrase = true;
				passphraseInput.addClass("form_input_error_div");
			} else {
				formErrors.passphrase = false;
				passphraseInput.removeClass("form_input_error_div");
			}
		}

		if (_updateForm) updateForm();
	}
	
	function validateSplit(_updateForm, strictBlankAndRange) {
		
		// handle split not checked
		if (!splitCheckbox.is(":checked")) {
			formErrors.split = false;
			numPiecesInput.removeClass("form_input_error_div");
			minPiecesInput.removeClass("form_input_error_div");
		}
		
		// handle if split checked
		else {
			formErrors.split = false;
			
			// validate num pieces
			var numPiecesError = false;
			var numPieces = Number(numPiecesInput.val());
			if (strictBlankAndRange) {
				if (!numPiecesInput.val() || !isInt(numPieces) || numPieces < 2) {
					numPiecesError = true;
					formErrors.split = true;
					numPiecesInput.addClass("form_input_error_div");
				} else {
					numPiecesInput.removeClass("form_input_error_div");
				}
			} else {
				if (!numPiecesInput.val() || isInt(numPieces)) {
					numPiecesInput.removeClass("form_input_error_div");
				} else {
					numPiecesError = true;
					formErrors.split = true;
					numPiecesInput.addClass("form_input_error_div");
				}
			}
			
			// validate min pieces
			var minPieces = Number(minPiecesInput.val());
			if (strictBlankAndRange) {
				if (!minPiecesInput.val() || !isInt(minPieces) || minPieces < 2 || (!numPiecesError && minPieces > numPieces)) {
					formErrors.split = true;
					minPiecesInput.addClass("form_input_error_div");
				} else {
					minPiecesInput.removeClass("form_input_error_div");
				}
			} else {
				if (!minPiecesInput.val() || isInt(minPieces)) {
					minPiecesInput.removeClass("form_input_error_div");
				} else {
					formErrors.split = true;
					minPiecesInput.addClass("form_input_error_div");
				}
			}
		}
		
		if (_updateForm) updateForm();
	}
	
	function setGenerateEnabled(generateEnabled) {
		btnGenerate.unbind("click");
		if (generateEnabled) {
			btnGenerate.removeClass("form_generate_btn_disabled");
			btnGenerate.click(function() { onGenerate(); });
		} else {
			btnGenerate.addClass("form_generate_btn_disabled");
		}
	}
	
	/**
	 * Encapsulate a currency input.
	 * 
	 * @param div is the div to render to
	 * @param idx is the index of this input relative to the other inputs to accomodate ddslick's id requirement
	 * @param defaultTicker is the ticker of the initial selected currency
	 * @param onCurrencyChanged(ticker) is invoked when the user changes the currency selection
	 * @param onDelete is invoked when the user delets this input
	 * @param onValid(bool) is invoked when the validity state changes
	 */
	function CurrencyInput(div, idx, plugins, defaultTicker, onCurrencyChanged, onDelete, onValid) {
		assertInitialized(div);
		assertInitialized(plugins);
		
		var that = this;
		var selectedPlugin;
		var numKeysInput;
		var selector;
		var selectorData;
		var trashDiv;
		var trashImg;
		var initializing = true;
		var valid = true;
		
		this.getDiv = function() {
			return div;
		}
		
		this.getSelectedPlugin = function() {
			return selectedPlugin;
		}
		
		this.setSelectedCurrency = function(ticker) {
			var name = AppUtils.getCryptoPlugin(ticker).getName();
			for (var i = 0; i < selectorData.length; i++) {
				if (selectorData[i].text === name) {
					selector.ddslick('select', {index: i});
					selectedPlugin = plugins[i];
					LOADER.load(selectedPlugin.getDependencies());	// start loading dependencies
					if (!initializing) onCurrencyChanged(selectedPlugin.getTicker());
					break;
				}
			}
		}
		
		this.getNumKeys = function() {
			var num = Number(numKeysInput.val());
			if (isInt(num)) return num;
			return null;
		}
		
		this.setTrashEnabled = function(enabled) {
			trashDiv.unbind("click");
			if (enabled) {
				trashDiv.click(function() { onDelete(); });
				trashImg.removeClass("trash_div_disabled");
			} else {
				trashImg.addClass("trash_div_disabled");
			}
		}
		
		this.isValid = function() {
			return valid;
		}
		
		// ---------------------- PRIVATE ------------------------
		
		function validate(ignoreBlank) {
			
			// check for blank box
			if (ignoreBlank && !numKeysInput.val()) {
				numKeysInput.removeClass("form_input_error_div");
				return;
			}
			
			// validate num keys
			var numKeys = that.getNumKeys();
			if (isInt(numKeys) && numKeys >= 1) {
				numKeysInput.removeClass("form_input_error_div");
				if (!valid) {
					valid = true;
					onValid(valid);
				}
			} else {
				numKeysInput.addClass("form_input_error_div");
				if (valid) {
					valid = false;
					onValid(false);
				}
			}
		}
		
		// render input
		render();
		function render() {
			div.empty();
			div.attr("class", "currency_input_div");
			
			// format pull down plugin data
			selectorData = [];
			for (var i = 0; i < plugins.length; i++) {
				var plugin = plugins[i];
				selectorData.push({
					text: plugin.getName(),
					imageSrc: plugin.getLogo().get(0).src
				});
			}
			
			// get default selected index
			var defaultSelectedIndex = 0;
			if (defaultTicker) {
				for (var i = 0; i < plugins.length; i++) {
					if (plugins[i].getTicker() === defaultTicker) defaultSelectedIndex = i;
				}
			}
			
			// create pull down
			selector = $("<div id='currency_selector_" + idx + "'>").appendTo(div);
			selector.ddslick({
				data:selectorData,
				background: "white",
				imagePosition: "left",
				selectText: "Select a Currency",
				defaultSelectedIndex: defaultSelectedIndex,
				onSelected: function(selection) {
					selectedPlugin = plugins[selection.selectedIndex];
					LOADER.load(selectedPlugin.getDependencies());	// start loading dependencies
					onCurrencyChanged(selectedPlugin.getTicker());
				},
			});
			selector = $("#currency_selector_" + idx);	// ddslick requires id reference
			that.setSelectedCurrency(defaultTicker ? defaultTicker : "BTC");	// does not initialize pull down with this value, but sets instance variables
			
			// create right div
			var rightDiv = $("<div class='currency_input_right_div'>").appendTo(div);
			rightDiv.append("Key pairs to generate&nbsp;&nbsp;");
			numKeysInput = $("<input type='tel' value='1' min='1'>").appendTo(rightDiv);
			numKeysInput.on("input", function(e) { validate(true); });
			numKeysInput.on("focusout", function(e) { validate(false); });
			rightDiv.append("&nbsp;&nbsp;");
			trashDiv = $("<div class='trash_div'>").appendTo(rightDiv);
			trashDiv.click(function() { onDelete(); });
			trashImg = $("<img class='trash_img' src='img/trash.png'>").appendTo(trashDiv);
			
			// no longer initializing
			initializing = false;
		}
	}
}
inheritsFrom(FormController, DivController);

/**
 * Import page.
 */
function ImportController(div) {
	DivController.call(this, div);
	this.render = function(onDone) {
		
		// div setup
		div.empty();
		div.attr("class", "content_div");
		var pageDiv = $("<div class='page_div import_page'>").appendTo(div);
		
		// filler to push import div down
		$("<div class='import_filler'>").appendTo(pageDiv);
		
		// all import content including tabs
		var importDiv = $("<div class='import_div'>").appendTo(pageDiv);
		
		// render import file and text divs
		var importFileDiv = $("<div>");
		var importTextDiv = $("<div>");
		new ImportFileController(importFileDiv).render(function() {
			new ImportTextController(importTextDiv, AppUtils.getCryptoPlugins()).render(function() {
				new TwoTabController(importDiv, "Import From File", importFileDiv, "Import From Text", importTextDiv).render(function() {
					if (onDone) onDone(div);
				});
			});
		});
	}
}
inheritsFrom(ImportController, DivController);

/**
 * Controller to import from file.
 * 
 * @param div is the div to render to
 */
function ImportFileController(div) {
	DivController.call(this, div);
	
	var that = this;
	var warningDiv;
	var warningMsg;
	var contentDiv;								// div for all non control links
	var importDiv;								// div for all file import
	var importedNamedPieces = [];	// [{name: 'btc.json', value: {...}}, ...]
	var importedPiecesDiv;				// shows imported item;
	var controlsDiv;							// div for all control links
	var lastKeys;
	var decryptionController;
	
	this.render = function(onDone) {
		
		// div setup
		div.empty();
		div.addClass("import_content_div");
		
		// warning div
		warningDiv = $("<div class='import_warning_div'>").appendTo(div);
		warningDiv.hide();
		
		// set up content div
		contentDiv = $("<div>").appendTo(div);
		
		// all file importing
		importDiv = $("<div>").appendTo(contentDiv);
		
		// drag and drop importDiv
		var dragDropDiv = $("<div class='import_drag_drop'>").appendTo(importDiv);
		var dragDropImg = $("<img class='drag_drop_img' src='img/drag_and_drop.png'>").appendTo(dragDropDiv);
		var dragDropText = $("<div class='drag_drop_text'>").appendTo(dragDropDiv);
		var dragDropLabel = $("<div class='drag_drop_label'>").appendTo(dragDropText);
		dragDropLabel.append("Drag and Drop Files To Import");
		var dragDropBrowse = $("<div class='drag_drop_browse'>").appendTo(dragDropText);
		dragDropBrowse.append("or click to browse");
		
		// register browse link with hidden input
		var inputFiles = $("<input type='file' multiple accept='.json,.zip'>").appendTo(dragDropDiv);
		inputFiles.change(function() { onFilesImported($(this).get(0).files); });
		inputFiles.hide();
		dragDropBrowse.click(function() {
			inputFiles.click();
		});
		
		// setup drag and drop
		setupDragAndDrop(dragDropDiv, onFilesImported);
		
		// imported files
		importedPiecesDiv = $("<div class='import_imported_pieces'>").appendTo(importDiv);
		importedPiecesDiv.hide();
		
		// controls
		controlsDiv = $("<div class='import_controls'>").appendTo(div);
		controlsDiv.hide();
		resetControls();
		
		// done rendering
		if (onDone) onDone(div);
	}
	
	this.getWarning = function() {
		return that.warningMsg;
	}
	
	this.setWarning = function(str, img) {
		that.warningMsg = str;
		warningDiv.hide();
		warningDiv.empty();
		if (str) {
			if (!img) img = $("<img src='img/warning.png'>");
			warningDiv.append(img);
			img.addClass("import_warning_div_icon");
			warningDiv.append(str);
			warningDiv.show();
		} else {
			warningDiv.hide();
		}
	}
	
	this.addNamedPieces = function(namedPieces, onDone) {
		for (var i = 0; i < namedPieces.length; i++) {
			var namedPiece = namedPieces[i];
			try {
				AppUtils.validatePiece(namedPiece.piece);
				if (!isPieceImported(namedPiece.name)) importedNamedPieces.push(namedPiece);
			} catch (err) {
				that.setWarning("Invalid piece '" + namedPiece.name + "': " + err.message);
			}
		}
		updatePieces(onDone);
	}
	
	this.startOver = function() {
		that.setWarning("");
		contentDiv.children().detach();
		importedPiecesDiv.hide();
		controlsDiv.hide();
		removePieces();
		contentDiv.append(importDiv);
		if (decryptionController) decryptionController.cancel();
	}
	
	// ------------------------ PRIVATE ------------------
	
	function resetControls() {
		controlsDiv.empty();
		addControl("start over", that.startOver);
	}
	
	function addControl(text, onClick) {
		var linkDiv = $("<div class='import_control_link_div'>").appendTo(controlsDiv);
		var link = $("<div class='import_control_link'>").appendTo(linkDiv);
		link.append(text);
		link.click(function() { onClick(); });
	}
	
	function getImportedPieces() {
		var pieces = [];
		for (var i = 0; i < importedNamedPieces.length; i++) {
			pieces.push(importedNamedPieces[i].piece);
		}
		return pieces;
	}
	
	function onKeysImported(keys) {
		resetControls();
		that.setWarning("");
		keys = listify(keys);
		assertTrue(keys.length > 0);
		if (keys[0].isEncrypted()) {
			
			// create decryption controller and register callbacks
			decryptionController = new DecryptionController($("<div>"), keys, function(warning) {
				that.setWarning(warning);
			}, function(decryptedKeys, pieces, pieceDivs) {
				onKeysDecrypted(getImportedPieces(), decryptedKeys, pieces, pieceDivs);
			});
			
			// render decryption controller
			decryptionController.render(function(decryptionDiv) {
				
				// replace content div with passphrase input
				contentDiv.children().detach();
				contentDiv.append(decryptionDiv);
				decryptionController.focus();
				
				// add control to view encrypted keys
				addControl("view encrypted keys", function() {
					UiUtils.openStorage("Imported Storage", getImportedPieces(), null, keys, null, null, false);
				});
			});
		} else {
			onKeysDecrypted(getImportedPieces(), keys);
		}
	}
	
	function onKeysDecrypted(importedPieces, keys, pieces, pieceDivs) {
		resetControls();
		contentDiv.children().detach();
		var viewDecrypted = $("<div class='import_view_button'>").appendTo(contentDiv);
		viewDecrypted.append("View Decrypted Keys");
		viewDecrypted.click(function() {
			UiUtils.openStorage("Imported Storage", importedPieces, null, keys, pieces, pieceDivs, false);
		});
	}
	
	// handle imported files
	function onFilesImported(files) {
		
		// collect functions to read files
		var funcs = [];
		for (var i = 0; i < files.length; i++) {
			funcs.push(readFileFunc(files[i]));
		};
		
		function readFileFunc(file) {
			return function(onDone) { readFile(file, onDone); }
		}
		
		// read files asynchronously
		async.parallel(funcs, function(err, results) {
			if (err) throw err;
			
			// collect named pieces from results
			var namedPieces = [];
			for (var i = 0; i < results.length; i++) {
				if (results[i]) namedPieces = namedPieces.concat(results[i]);
			}
			
			// add all named pieces
			if (namedPieces.length) that.addNamedPieces(namedPieces);
		});
		
		// reads the given file and calls onNamedPieces(err, namedPieces) when done
		function readFile(file, onNamedPieces) {
			var reader = new FileReader();
			reader.onload = function() {
				getNamedPiecesFromFile(file, reader.result, function(err, namedPieces) {
					if (err) {
						that.setWarning(err.message);
						onNamedPieces(null, null);
					}
					else if (namedPieces.length === 0) {
						if (isJsonFile(file)) that.setWarning("File '" + file.name + "' is not a valid json piece");
						else if (isZipFile(file)) that.setWarning("Zip '" + file.name + "' does not contain any valid json pieces");
						else throw new Error("Unrecognized file type: " + file.type);
					} else {
						onNamedPieces(null, namedPieces);
					}
				});
			}
			if (isJsonFile(file)) reader.readAsText(file);
			else if (isZipFile(file)) reader.readAsArrayBuffer(file);
			else that.setWarning("File is not a zip or json file");
		}
		
		function getNamedPiecesFromFile(file, data, onNamedPieces) {
			if (isJsonFile(file)) {
				var piece;
				try {
					piece = JSON.parse(data);
				} catch (err) {
					onNamedPieces(Error("Could not parse JSON content from '" + file.name + "'"));
				}
				var namedPiece = {name: file.name, piece: piece};
				onNamedPieces(null, [namedPiece]);
			}
			else if (isZipFile(file)) {
				LOADER.load("lib/jszip.js", function() {
					AppUtils.zipToPieces(data, function(namedPieces) {
						onNamedPieces(null, namedPieces);
					});
				});
			}
		}
	}
	
	function isPieceImported(name) {
		for (var i = 0; i < importedNamedPieces.length; i++) {
			if (importedNamedPieces[i].name === name) return true;
		}
		return false;
	}
	
	function removePieces() {
		importedNamedPieces = [];
		lastKeys = undefined;
		updatePieces();
	}
	
	function removePiece(name) {
		for (var i = 0; i < importedNamedPieces.length; i++) {
			if (importedNamedPieces[i].name === name) {
				importedNamedPieces.splice(i, 1);
				that.setWarning("");
				updatePieces();
				return;
			}
		}
		throw new Error("No piece with name '" + name + "' imported");
	}
	
	function updatePieces(onDone) {
		
		// update UI
		renderImportedPieces(importedNamedPieces);
		
		// collect all pieces
		var pieces = [];
		for (var i = 0; i < importedNamedPieces.length; i++) pieces.push(importedNamedPieces[i].piece);
		if (!pieces.length) {
			if (onDone) onDone();
			return;
		}
		
		// collect tickers being imported
		var tickers = [];
		for (var i = 0; i < pieces[0].keys.length; i++) tickers.push(pieces[0].keys[i].ticker);
		tickers = toUniqueArray(tickers);
		
		// collect dependencies
		var dependencies = AppUtils.APP_DEPENDENCIES.slice();
		for (var i = 0; i < tickers.length; i++) {
			var ticker = tickers[i];
			var plugin = AppUtils.getCryptoPlugin(ticker);
			for (var j = 0; j < plugin.getDependencies().length; j++) dependencies.push(plugin.getDependencies()[j]);
		}
		dependencies = toUniqueArray(dependencies);
		
		// load dependencies
		LOADER.load(dependencies, function() {
			
			// create keys
			try {
				
				// add control to view pieces
				addControl("view imported pieces", function() {
					UiUtils.openStorage("Imported Storage", null, null, null, pieces, null, false);
				});
				
				// attempt to get keys
				var keys = AppUtils.piecesToKeys(pieces);
				if (keysDifferent(lastKeys, keys) && keys.length) onKeysImported(keys);
				lastKeys = keys;
			} catch (err) {
				var img = err.message.indexOf("additional piece") > 0 ? $("<img src='img/files.png'>") : null;
				that.setWarning(err.message, img);
			}
			if (onDone) onDone();
		});
		
		function keysDifferent(keys1, keys2) {
			if (!keys1 && keys2) return true;
			if (keys1 && !keys2) return true;
			if (keys1.length !== keys2.length) return true;
			for (var i = 0; i < keys1.length; i++) {
				if (!keys1[i].equals(keys2[i])) return true;
			}
			return false;
		}
	}
	
	function renderImportedPieces(namedPieces) {
		
		// reset state
		resetControls();
		importedPiecesDiv.empty();
		
		// hide imported pieces and controls if no pieces
		if (namedPieces.length === 0) {
			importedPiecesDiv.hide();
			controlsDiv.hide();
			return;
		}
		
		// render imported pieces
		for (var i = 0; i < namedPieces.length; i++) {
			importedPiecesDiv.append(getImportedPieceDiv(namedPieces[i]));
		}
		function getImportedPieceDiv(namedPiece) {
			var importedPieceDiv = $("<div class='import_file_imported_piece'>").appendTo(importedPiecesDiv);
			var icon = $("<img src='img/file.png' class='import_imported_icon'>").appendTo(importedPieceDiv);
			importedPieceDiv.append(namedPiece.name);
			var trash = $("<img src='img/trash.png' class='import_imported_trash'>").appendTo(importedPieceDiv);
			trash.click(function() { removePiece(namedPiece.name); });
			return importedPieceDiv;
		}
		
		// show imported pieces and controls
		importedPiecesDiv.show();
		controlsDiv.show();
	}
	
	/**
	 * Sets up a drag and drop zone.
	 * 
	 * @param div is the drop zone as a jquery node
	 * @param onFilesImported(files) is called when files are dropped into the drop zone
	 */
	function setupDragAndDrop(div, onFilesImported) {
		
		// register drag and drop events
		div.get(0).ondrop = function(event) {
			event.preventDefault();  
	    event.stopPropagation();
			div.removeClass("inner_outline");
			var dt = event.dataTransfer;
			
			// use DataTransferItemList interface to access file(s)
			if (dt.items) {
				var files = [];
				for (var i = 0; i < dt.items.length; i++) {
					if (dt.items[i].kind == 'file') {
						files.push(dt.items[i].getAsFile());
					}
				}
				onFilesImported(files);
			}
			
			// use DataTransfer interface to access file(s)
			else {
				onFilesImported(dt.files);
			}
		}
		div.get(0).ondragenter = function(event) {
			div.addClass("inner_outline");
		}
		div.get(0).ondragexit = function(event) {
			div.removeClass("inner_outline");
		}
		div.get(0).ondragover = function(event) {
			event.preventDefault();  
	    event.stopPropagation();
	    event.dataTransfer.dropEffect = 'copy';
		}
	}
}
inheritsFrom(ImportFileController, DivController);

/**
 * Controller to import from text.
 * 
 * @param div is the div to render to
 */
function ImportTextController(div, plugins) {
	DivController.call(this, div);
	assertTrue(plugins.length > 0);
	
	var MAX_PIECE_LENGTH = 58;	// max length of piece strings to render
	
	var warningDiv;
	var contentDiv;
	var passphraseInputDiv;
	var selector;
	var selectorDisabler;
	var selectedPlugin;
	var textArea;
	var importedPieces = [];	// string[]
	var importedPiecesDiv;		// div for imported pieces
	var controlsDiv;
	var lastKeys;
	var decryptionController;
	
	this.render = function(onDone) {
		
		// div setup
		div.empty();
		div.addClass("import_content_div");
		
		// warning div
		warningDiv = $("<div class='import_warning_div'>").appendTo(div);
		warningDiv.hide();
		
		// set up content div
		contentDiv = $("<div>").appendTo(div);
		
		// all passphrase input
		passphraseInputDiv = $("<div>").appendTo(contentDiv);
		
		// currency selector data
		selectorData = [];
		for (var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			selectorData.push({
				text: plugin.getName(),
				imageSrc: plugin.getLogo().get(0).src
			});
		}
		
		// currency selector
		var selectorContainer = $("<div class='import_selector_container'>").appendTo(passphraseInputDiv);
		selector = $("<div id='import_selector'>").appendTo(selectorContainer);
		
		// text area
		textArea = $("<textarea class='import_textarea'>").appendTo(passphraseInputDiv);
		textArea.attr("placeholder", "Enter a private key or split pieces of a private key");
		
		// submit button
		var submit = $("<div class='import_button'>").appendTo(passphraseInputDiv);
		submit.html("Submit");
		submit.click(function() { submitPieces(); });
		
		// imported pieces
		importedPiecesDiv = $("<div class='import_imported_pieces'>").appendTo(passphraseInputDiv);
		importedPiecesDiv.hide();
		
		// controls
		controlsDiv = $("<div class='import_controls'>").appendTo(div);
		controlsDiv.hide();
		resetControls();
		
		// initialize pull down
		LOADER.load("lib/jquery.ddslick.js", function() {	// ensure loaded before or only return after loaded
			selector.ddslick({
				data:selectorData,
				background: "white",
				imagePosition: "left",
				selectText: "Select a Currency",
				width:'100%',
				defaultSelectedIndex: 0,
				onSelected: function(selection) {
					selectedPlugin = plugins[selection.selectedIndex];
					LOADER.load(selectedPlugin.getDependencies());	// start loading dependencies
				},
			});
			selector = $("#import_selector");	// ddslick requires id reference
			selectorDisabler = $("<div class='import_selector_disabler'>").appendTo(selectorContainer);
			startOver();
			
			// done rendering
			if (onDone) onDone(div);
		});
	}
	
	function resetControls() {
		controlsDiv.empty();
		addControl("start over", startOver);
	}
	
	function addControl(text, onClick) {
		var linkDiv = $("<div class='import_control_link_div'>").appendTo(controlsDiv);
		var link = $("<div class='import_control_link'>").appendTo(linkDiv);
		link.append(text);
		link.click(function() { onClick(); });
	}
	
	function startOver() {
		setWarning("");
		textArea.val("");
		contentDiv.children().detach();
		importedPiecesDiv.hide();
		controlsDiv.hide();
		contentDiv.append(passphraseInputDiv);
		removePieces();
		setSelectedCurrency("BTC");
		if (decryptionController) decryptionController.cancel();
	}
	
	function setSelectorEnabled(bool) {
		if (bool) {
			$("#import_selector *").removeClass("disabled_text");
			selectorDisabler.hide();
		} else {
			$("#import_selector *").addClass("disabled_text");
			selectorDisabler.show();
		}
	}
	
	function onKeysImported(keys) {
		keys = listify(keys);
		assertTrue(keys.length > 0);
		if (keys[0].isEncrypted()) {
			
			// create decryption controller and register callbacks
			decryptionController = new DecryptionController($("<div>"), keys, function(warning) {
				setWarning(warning);
			}, function(decryptedKeys, pieces, pieceDivs) {
				onKeysDecrypted(decryptedKeys, pieces, pieceDivs);
			});
			
			// render decryption controller
			decryptionController.render(function(decryptionDiv) {
				
				// replace content div with passphrase input
				contentDiv.children().detach();
				contentDiv.append(decryptionDiv);
				decryptionController.focus();
				
				// add control to view encrypted keys
				addControl("view encrypted key", function() {
					UiUtils.openStorage("Imported Storage", null, null, keys, null, null, false);
				});
			});
		} else {
			onKeysDecrypted(keys);
		}
	}
	
	function onKeysDecrypted(keys, pieces, pieceDivs) {
		resetControls();
		contentDiv.children().detach();
		var viewDecrypted = $("<div class='import_view_button'>").appendTo(contentDiv);
		viewDecrypted.append("View Decrypted Key");
		viewDecrypted.click(function() {
			UiUtils.openStorage("Imported Storage", null, null, keys, pieces, pieceDivs, false);
		});
	}
	
	function setSelectedCurrency(ticker) {
		var name = AppUtils.getCryptoPlugin(ticker).getName();
		selector = $("#import_selector");
		for (var i = 0; i < selectorData.length; i++) {
			if (selectorData[i].text === name) {
				selector.ddslick('select', {index: i});
				selectedPlugin = plugins[i];
				break;
			}
		}
	}
	
	function setWarning(str, img) {
		warningDiv.empty();
		if (str) {
			if (!img) img = $("<img src='img/warning.png'>");
			warningDiv.append(img);
			img.addClass("import_warning_div_icon");
			warningDiv.append(str);
			warningDiv.show();
		} else {
			warningDiv.hide();
		}
	}
	
	function removePieces() {
		importedPieces = [];
		lastKeys = undefined;
		updatePieces();
	}
	
	function removePiece(piece) {
		for (var i = 0; i < importedPieces.length; i++) {
			if (importedPieces[i] === piece) {
				importedPieces.splice(i, 1);
				updatePieces();
				return;
			}
		}
		throw new Error("No piece imported: " + piece);
	}
	
	function submitPieces() {
		
		resetControls();
		
		// get and clear text
		var val = textArea.val();
		textArea.val("");
		
		// check for empty text
		if (val.trim() === "") {
			setWarning("No text entered");
			return;
		}
		
		// get lines
		var lines = getLines(val);
		
		// get lines with content
		var contentLines = [];
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];
			if (line.trim() !== "") contentLines.push(line);
		}
		
		// load dependencies
		var dependencies = [];
		for (var i = 0; i < selectedPlugin.getDependencies().length; i++) dependencies.push(selectedPlugin.getDependencies()[i]);
		dependencies = toUniqueArray(dependencies);
		LOADER.load(dependencies, function() {
			
			// add pieces
			updatePieces(contentLines);
		});
	}
	
	function updatePieces(newPieces) {
		
		// reset warning
		setWarning("");
		
		// interanl warning setter to track if warning is set
		var warningSet = false;
		function setWarningAux(str, icon) {
			setWarning(str, icon);
			warningSet = true;
		}
		
		// scenarios:
		// add private key, don't allow anything after
		// add private keys, add first, don't allow anything after
		// add piece, need additional, allow pieces, don't allow private key
		// add pieces, check if key created, allow pieces, don't allow private key
		
		// check for existing private key
		var key;
		if (importedPieces.length === 1) {
			try {
				key = selectedPlugin.newKey(importedPieces[0]);
			} catch (err) {
				// nothing to do
			}
		}
		
		// add new pieces
		if (newPieces) {
			if (key) setWarningAux("Private key already added");
			else {
				for (var i = 0; i < newPieces.length; i++) {
					var piece = newPieces[i];
					if (arrayContains(importedPieces, piece)) {
						setWarningAux("Piece already added");
						continue;
					}
					if (key) setWarningAux("Private key alread added");
					else {
						try {
							var thisKey = selectedPlugin.newKey(piece);
							if (importedPieces.length > 0) setWarningAux("Cannot add private key to existing pieces");
							else {
								key = thisKey;
								importedPieces.push(piece);
							}
						} catch (err) {
							if (AppUtils.isPossibleSplitPiece(piece)) importedPieces.push(piece);
							else setWarningAux("Invalid private key or piece");
						}
					}
				}
			}
		}
		
		// check if pieces combine to make private key
		if (!key && importedPieces.length > 0) {
			try {
				key = selectedPlugin.combine(importedPieces);
			} catch (err) {
				if (!warningSet) {
					var img = err.message.indexOf("additional piece") > 0 ? $("<img src='img/files.png'>") : null;
					setWarning(err.message, img);
				}
			}
		}
		
		// render pieces
		renderImportedPieces(importedPieces);
		
		// selector only enabled if no pieces
		setSelectorEnabled(importedPieces.length === 0);
		
		// handle if key exists
		if (key) onKeysImported(key);
	}
	
	function renderImportedPieces(pieces) {
		importedPiecesDiv.empty();
		if (pieces.length === 0) {
			importedPiecesDiv.hide();
			controlsDiv.hide();
			return;
		}
		
		importedPiecesDiv.show();
		controlsDiv.show();
		for (var i = 0; i < pieces.length; i++) {
			importedPiecesDiv.append(getImportedPieceDiv(pieces[i]));
		}
		
		function getImportedPieceDiv(piece) {
			var importedPieceDiv = $("<div class='import_text_imported_piece'>").appendTo(importedPiecesDiv);
			var icon = $("<img src='img/file.png' class='import_imported_icon'>").appendTo(importedPieceDiv);
			importedPieceDiv.append(AppUtils.getShortenedString(piece, MAX_PIECE_LENGTH));
			var trash = $("<img src='img/trash.png' class='import_imported_trash'>").appendTo(importedPieceDiv);
			trash.click(function() { removePiece(piece); });
			return importedPieceDiv;
		}
	}
}
inheritsFrom(ImportTextController, DivController);

/**
 * Controls passphrase input and key decryption on import.
 * 
 * @param div is the div to render to
 * @param encrypted keys is an array of encrypted CryptoKeys
 * @param onWarning(msg) is called when this controller reports a warning
 * @param onKeysDecrypted(keys, pieces, pieceDivs) is invoked on successful decryption
 */
function DecryptionController(div, encryptedKeys, onWarning, onKeysDecrypted) {
	DivController.call(this, div);
	
	var that = this;
	var labelDiv;
	var inputDiv;
	var passphraseInput;
	var progressDiv;
	var submitButton;
	var canceller = {};
	
	this.render = function(onDone) {
		
		// set up div
		div.empty();
		div.addClass("import_decryption_div");
		
		// label
		labelDiv = $("<div class='import_decrypt_label'>").appendTo(div);
		
		// passphrase input
		inputDiv = $("<div>").appendTo(div);
		passphraseInput = $("<input type='password' class='import_passphrase_input'>").appendTo(inputDiv)
		submitButton = $("<div class='import_button'>").appendTo(inputDiv);
		submitButton.html("Submit");
		submitButton.click(function() { onSubmit(); });
		
		// progress bar
		progressDiv = $("<div class='import_progress_div'>").appendTo(div);
		
		// initial state
		init();
		
		// register passphrase enter key
		passphraseInput.keyup(function(e) {
			var code = e.which;
	    if (code == 13) {
	    	e.preventDefault();
	      submitButton.click();
	    }
		});
		
		if (onDone) onDone(div);
	}
	
	this.focus = function() {
		passphraseInput.focus();
	}
	
	this.cancel = function() {
		canceller.isCancelled = true;
	}
	
	function init() {
		progressDiv.hide();
		labelDiv.html("Passphrase");
		labelDiv.show();
		inputDiv.show();
		that.focus();
	}
	
	function onSubmit() {
		
		// clear warning
		onWarning("");
		
		// get passphrase
		var passphrase = passphraseInput.val();
		passphraseInput.val('');
		
		// validate passphrase
		if (!passphrase || passphrase.trim() === "") {
			onWarning("Enter a passphrase to decrypt private keys");
			return;
		}
		
		// compute weights for progress bar
		var decryptWeight = AppUtils.getWeightDecryptKeys(encryptedKeys);
		var renderWeight = PieceRenderer.getWeight(encryptedKeys.length, 1, null);
		var totalWeight = decryptWeight + renderWeight;
		
		// switch content div to progress bar
		inputDiv.hide();
		progressDiv.show();
		progressDiv.empty();
		progressBar = UiUtils.getProgressBar(progressDiv);
		
		// let UI breath
		setImmediate(function() {
			
			// decrypt keys async
			var copies = [];
			for (var i = 0; i < encryptedKeys.length; i++) copies.push(encryptedKeys[i].copy());
			AppUtils.decryptKeys(copies, passphrase, canceller, function(percent, label) {
				setProgress(percent * decryptWeight / totalWeight, label);
			}, function(err, decryptedKeys) {
				if (canceller && canceller.isCancelled) return;
				
				// if error, switch back to input div
				if (err) {
					onWarning(err.message);
					init();
					return;
				}
				
				// convert keys to pieces
				var pieces = AppUtils.keysToPieces(decryptedKeys);
				
				// render pieces
				new PieceRenderer(pieces, null, null).render(function(percentDone) {
					setProgress((decryptWeight + percentDone * renderWeight) / totalWeight, "Rendering...");
				}, function(err, pieceDivs) {
					if (err) throw err;
					onKeysDecrypted(decryptedKeys, pieces, pieceDivs);
				});
			});
		});
	}
	
	function setProgress(percent, label) {
		assertTrue(percent >= 0 && percent <= 1);
		progressBar.set(percent);
		progressBar.setText(Math.round(percent * 100) + "%");
		if (label) labelDiv.html(label);
	}
}
inheritsFrom(DecryptionController, DivController);

/**
 * Manages up to two tabs of content.  Hides tabs if only one content given.
 * 
 * @param div is the div to render all tab content to
 * @param tabName1 is the name of the first tab
 * @param tabContent1 is the content tab of the first tab
 * @param tabName2 is the name of the second tab (optional)
 * @param tabContent2 is the content tab of the second tab (optional)
 * @param defaultTabIdx is the default tab index (optional)
 */
function TwoTabController(div, tabName1, tabContent1, tabName2, tabContent2, defaultTabIdx) {
	DivController.call(this, div);
	
	var tabsDiv;
	var tab1;
	var tab2;
	var contentDiv;
	
	this.render = function(onDone) {
		
		// no tabs if one content div
		if (!tabContent2) {
			div.append(tabContent1);
			return;
		}
		
		// set up tabs
		tabsDiv = $("<div class='import_tabs_div'>").appendTo(div);
		tab1 = $("<div class='import_tab_div'>").appendTo(tabsDiv);
		tab1.html(tabName1);
		tab1.click(function() { selectTab(0); });
		tab2 = $("<div class='import_tab_div'>").appendTo(tabsDiv);
		tab2.html(tabName2);
		tab2.click(function() { selectTab(1); });
		
		// add content div
		contentDiv = $("<div>").appendTo(div);
		
		// start on first tab by default
		selectTab(defaultTabIdx ? defaultTabIdx : 0);
		
		// done rendering
		if (onDone) onDone(div);
	}
	
	this.getTabsDiv = function() {
		return tabsDiv;
	}
	
	function selectTab(idx) {
		switch(idx) {
		case 0:
			tab1.addClass("active_tab");
			tab2.removeClass("active_tab");
			contentDiv.children().detach();
			contentDiv.append(tabContent1);
			break;
		case 1:
			tab1.removeClass("active_tab");
			tab2.addClass("active_tab");
			contentDiv.children().detach();
			contentDiv.append(tabContent2);
			break;
		default:
			throw new Error("Tab index must be 0 or 1 but was " + idx);
		}
	}
}
inheritsFrom(TwoTabController, DivController);

/**
 * Export page.
 * 
 * At least one of keyGenConfig, keys, pieces, and pieceDivs are required.
 * 
 * @param div is the div to render to
 * @param window is a reference to the window for printing
 * @param keyGenConfig is a configuration to generate new storage
 * @param keys are keys to generate pieces from
 * @param pieces are pieces to export and generate pieceDivs from
 * @param pieceDivs are pre-generated piece divs ready for display
 * @param confirmExit specifies if the window should confirm exit if not saved or printed
 */
function ExportController(div, window, keyGenConfig, keys, pieces, pieceDivs, confirmExit) {
	DivController.call(this, div);
	
	// global variables
	var saved = false;
	var progressDiv;
	var progressBar;
	var progressLabel;
	var saveButton;
	var printButton;
	var savePublicButton;
	var showPublicCheckbox;
	var showPrivateCheckbox;
	var showLogosCheckbox;
	var paginator;
	var piecesDiv;
	var printEnabled;
	var lastRenderer;
	
	// confirm exit if storage not saved or printed
	if (confirmExit) {
		window.addEventListener("beforeunload", function (e) {
			if (!saved) {
			  var confirmationMessage = "Your storage has not been saved or printed.";
			  (e || window.event).returnValue = confirmationMessage;	// Gecko + IE
			  return confirmationMessage;     												// Webkit, Safari, Chrome
			}               
		});
	}
	
	this.render = function(onDone) {
		div.empty();
		div.addClass("export_div");
		
		// export header
		var exportHeader = $("<div class='export_header'>").appendTo(div);
		
		// export buttons
		var exportButtons = $("<div class='export_buttons'>").appendTo(exportHeader);
		saveButton = $("<div class='export_button'>").appendTo(exportButtons);
		saveButton.html("Save All");
		printButton = $("<div class='export_button'>").appendTo(exportButtons);
		printButton.html("Print All");
		savePublicButton = $("<div class='export_button'>").appendTo(exportButtons);
		savePublicButton.html("Save Public Addresses");
//		var moreButton = $("<div class='export_button'>").appendTo(exportButtons);
//		moreButton.html("...");
//		moreButton.click(function() { console.log("More button clicked"); });
		
		// export checkboxes
		var exportCheckboxes = $("<div class='export_checkboxes'>").appendTo(exportHeader);
		showPublicCheckbox = $("<input type='checkbox' class='export_checkbox' id='showPublicCheckbox'>").appendTo(exportCheckboxes);
		var showPublicCheckboxLabel = $("<label class='export_checkbox_label' for='showPublicCheckbox'>").appendTo(exportCheckboxes);
		showPublicCheckboxLabel.html("Show public addresses");
		exportCheckboxes.append("&nbsp;&nbsp;&nbsp;");
		showPrivateCheckbox = $("<input type='checkbox' class='export_checkbox' id='showPrivateCheckbox'>").appendTo(exportCheckboxes);
		var showPrivateCheckboxLabel = $("<label class='export_checkbox_label' for='showPrivateCheckbox'>").appendTo(exportCheckboxes);
		showPrivateCheckboxLabel.html("Show private keys");
		exportCheckboxes.append("&nbsp;&nbsp;&nbsp;");
		showLogosCheckbox = $("<input type='checkbox' class='export_checkbox' id='showLogosCheckbox'>").appendTo(exportCheckboxes);
		var showLogosCheckboxLabel = $("<label class='export_checkbox_label' for='showLogosCheckbox'>").appendTo(exportCheckboxes);
		showLogosCheckboxLabel.html("Show logos");
		
		// apply default state
		showPublicCheckbox.prop('checked', true);
		showPrivateCheckbox.prop('checked', true);
		showLogosCheckbox.prop('checked', true);
		
		// sort pieces and pieceDivs by piece number
		sortPieces();
		
		// piece selection
		var paginatorSource = getPaginatorSource(keyGenConfig, pieces);
		if (paginatorSource) {
			paginator = $("<div id='paginator'>").appendTo(exportHeader);
			$("#paginator").pagination({
				dataSource: paginatorSource,
				pageSize: 1,
				callback: function(data, pagination) {
					if (pieceDivs) setVisiblePiece(pieceDivs, pagination.pageNumber - 1);
				}
			});
			$("<div class='export_piece_selection_label'>Pieces</div>").appendTo(exportHeader);
		}
		
		// notice div
		var noticeDivContainer = $("<div class='notice_div_container'>").appendTo(div);
		var noticeDiv = $("<div>").appendTo(noticeDivContainer);
		new NoticeController(noticeDiv).render();
		
		// progress bar
		progressDiv = $("<div class='export_progress_div'>").appendTo(div);
		progressDiv.hide();
		progressBar = UiUtils.getProgressBar(progressDiv);
		progressLabel = $("<div class='export_progress_label'>").appendTo(progressDiv);
		
		// currently showing piece
		piecesDiv = $("<div class='export_pieces_div'>").appendTo(div);
		
		// register events
		showPublicCheckbox.click(function() { update(); });
		showPrivateCheckbox.click(function() { update(); });
		showLogosCheckbox.click(function() { update(); });
		
		// controls disabled until ready
		setControlsEnabled(false);
		
		// build ui based on keyGenConfig, pieces, and pieceDivs
		update(pieceDivs);

		// done rendering
		if (onDone) onDone(div);
	}
	
	// --------------------------------- PRIVATE --------------------------------
	
	function sortPieces() {
		if (!pieces) return;
		
		// bind pieces and pieceDivs
		var elems = [];
		for (var i = 0; i < pieces.length; i++) {
			elems.push({
				piece: pieces[i],
				pieceDiv: pieceDivs ? pieceDivs[i] : null
			});
		}
		
		// sort elems
		elems.sort(function(elem1, elem2) {
			var num1 = elem1.piece.pieceNum;
			var num2 = elem2.piece.pieceNum;
			assertNumber(num1);
			assertNumber(num2);
			return num1 - num2;
		});
		
		// re-assign global pieces
		pieces = [];
		if (pieceDivs) pieceDivs = [];
		for (var i = 0; i < elems.length; i++) {
			var elem = elems[i];
			pieces.push(elem.piece);
			if (pieceDivs) pieceDivs.push(elem.pieceDiv);
		}
	}
	
	function getPaginatorSource(keyGenConfig, pieces) {
		if (keyGenConfig) {
			if (keyGenConfig.numPieces === 1) return null;
			var pieceNums = [];
			for (var i = 0; i < keyGenConfig.numPieces; i++) pieceNums.push(i + 1);
			return pieceNums;
		}
		if (pieces) {
			assertTrue(pieces.length >= 1);
			if (pieces.length === 1) return null;
			var pieceNums = [];
			for (var i = 0; i < pieces.length; i++) pieceNums.push(pieces[i].pieceNum);
			return pieceNums;
		}
		return null;
	}
	
	function getPieceRendererConfig() {
		return {
			showPublic: showPublicCheckbox.prop('checked'),
			showPrivate: showPrivateCheckbox.prop('checked'),
			showLogos: showLogosCheckbox.prop('checked')
		};
	}
	
	function printAll() {
		if (!printEnabled) return;
		saved = true;
		window.print();
	}
	
	function saveAll(pieces) {
		assertInitialized(pieces);
		assertTrue(pieces.length > 0);
		saved = true;
		var name = "cryptostorage_" + AppUtils.getCommonTicker(pieces[0]).toLowerCase() + "_" + AppUtils.getTimestamp();
		if (pieces.length === 1) {
			var jsonStr = AppUtils.pieceToJson(pieces[0]);
			saveAs(new Blob([jsonStr]), name + ".json");
		} else {
			AppUtils.piecesToZip(pieces, function(blob) {
				saveAs(blob, name + ".zip");
			});
		}
	}
	
	function savePublicAddresses() {
		assertInitialized(pieces);
		assertTrue(pieces.length > 0);
		var publicAddressesStr = AppUtils.pieceToAddresses(pieces[0]);
		saveAs(new Blob([publicAddressesStr]), "cryptostorage_" + AppUtils.getCommonTicker(pieces[0]).toLowerCase() + "_public_addresses.txt");
	}
	
	function setControlsEnabled(enabled) {
		saveButton.unbind("click");
		printButton.unbind("click");
		savePublicButton.unbind("click");
		setPrintEnabled(enabled);
		if (enabled) {
			saveButton.addClass("export_button");
			saveButton.removeClass("export_button_disabled");
			savePublicButton.addClass("export_button");
			savePublicButton.removeClass("export_button_disabled");
			showLogosCheckbox.removeAttr("disabled");
			saveButton.click(function() { saveAll(pieces); });
			printButton.click(function() { printAll(); });
			savePublicButton.click(function() { savePublicAddresses(); });
			updateHeaderCheckboxes();
		} else {
			saveButton.addClass("export_button_disabled");
			saveButton.removeClass("export_button");
			savePublicButton.addClass("export_button_disabled");
			savePublicButton.removeClass("export_button");
			showPublicCheckbox.attr("disabled", "disabled");
			showPrivateCheckbox.attr("disabled", "disabled");
			showLogosCheckbox.attr("disabled", "disabled");
		}
	}
	
	function setPrintEnabled(bool) {
		printEnabled = bool;
		if (bool) {
			printButton.addClass("export_button");
			printButton.removeClass("export_button_disabled");
		} else {
			printButton.addClass("export_button_disabled");
			printButton.removeClass("export_button");
		}
	}
	
	function update(_pieceDivs, onDone) {
		updateHeaderCheckboxes();
		pieceDivs = _pieceDivs;
		
		// add piece divs if given
		if (pieceDivs) {
			assertInitialized(pieces);
			setVisiblePiece(pieceDivs, paginator ? paginator.pagination('getSelectedPageNum') - 1 : 0);
			setPieceDivs(pieceDivs);
			setPrintEnabled(true);
			setControlsEnabled(true);
			if (onDone) onDone();
		}
		
		// else render from pieces
		else {
			pieceDivs = [];
			
			// render pieces if given
			if (pieces) {
				for (var i = 0; i < pieces.length; i++) pieceDivs.push($("<div>"));
				setVisiblePiece(pieceDivs, paginator ? paginator.pagination('getSelectedPageNum') - 1 : 0);
				setPieceDivs(pieceDivs);
				setPrintEnabled(false);
				if (lastRenderer) lastRenderer.cancel();
				lastRenderer = new PieceRenderer(pieces, pieceDivs, getPieceRendererConfig());
				lastRenderer.render(null, function(err, pieceDivs) {
					setPrintEnabled(true);
					setControlsEnabled(true);
					if (onDone) onDone();
				});
			}
			
			// generate pieces from keys if given
			else if (keys) {
				pieces = AppUtils.keysToPieces(keys);
				update();
			}
			
			// otherwise generate keys from config
			else {
				assertInitialized(keyGenConfig);
				setControlsEnabled(false);
				AppUtils.generateKeys(keyGenConfig, function(percent, label) {
					progressBar.set(percent);
					progressBar.setText(Math.round(percent * 100)  + "%");
					progressLabel.html(label);
					progressDiv.show();
				}, function(err, _keys, _pieces, _pieceDivs) {
					progressDiv.hide();
					if (err) {
						AppUtils.setRuntimeError(err);
						if (onDone) onDone(err);
					} else {
						keys = _keys;
						pieces = _pieces;
						pieceDivs = _pieceDivs;
						update(pieceDivs, onDone);
					}
				}, true);
			}
		}
	}
	
	function setPieceDivs(pieceDivs) {
		piecesDiv.empty();
		for (var i = 0; i < pieceDivs.length; i++) piecesDiv.append(pieceDivs[i]);
	}
	
	/**
	 * Sets the visible piece by adding/removing the hidden class.
	 * 
	 * @param pieceDivs are the piece divs to show/hide
	 * @param pieceIdx is the piece number to show
	 */
	function setVisiblePiece(pieceDivs, pieceIdx) {
		for (var i = 0; i < pieces.length; i++) {
			if (i === pieceIdx) pieceDivs[i].removeClass("hidden");
			else pieceDivs[i].addClass("hidden");
		}
	}
	
	function updateHeaderCheckboxes() {
		showPrivateCheckbox.prop('checked') ? showPublicCheckbox.removeAttr('disabled') : showPublicCheckbox.attr('disabled', 'disabled');
		showPublicCheckbox.prop('checked') ? showPrivateCheckbox.removeAttr('disabled') : showPrivateCheckbox.attr('disabled', 'disabled');
		showLogosCheckbox.removeAttr('disabled');
	}
}
inheritsFrom(ExportController, DivController);

/**
 * Controls the notices div.
 * 
 * @param div is the div to render to
 * @param config is the configuration:
 * 	{
 * 		showOnPass: bool,
 * 		showOnFail: bool,
 * 		showOnWarn: bool,
 * 	}
 */
function NoticeController(div, config) {
	DivController.call(this, div);
	
	var dismissed = {};
	var lastChecks;
	
	this.render = function(onDone) {
		
		// div setup
		div.addClass("notice_div");
		
		// merge configs
		config = objectAssign({}, getDefaultConfig(), config);
		
		// listen for environment
		AppUtils.addEnvironmentListener(function(info) {
			setEnvironmentInfo(info);
		});
	}
	
	function getDefaultConfig() {
		return {
			showOnFail: true,
			showOnWarn: true,
			showOnPass: false
		};
	}
	
	function setEnvironmentInfo(info) {
		
		// check if info cached
		if (lastChecks && objectsEqual(lastChecks, info.checks)) return;
		
		// reset cache
		lastChecks = info.checks;
		dismissed[AppUtils.EnvironmentCode.IS_ONLINE] = undefined;
		
		// render each shown notice bar
		div.empty();
		for (var i = 0; i < info.checks.length; i++) {
			
			// check if code and state are dismissed
			if (dismissed[info.checks[i].code] === info.checks[i].state) continue;
			
			if (info.checks[i].state === "pass" && config.showOnPass ||
					info.checks[i].state === "fail" && config.showOnFail ||
					info.checks[i].state === "warn" && config.showOnWarn) {
				renderNoticeBar($("<div>").appendTo(div), info.checks[i]);
			}
		}
		
		// renders a single notice bar
		function renderNoticeBar(noticeBar, check) {
			noticeBar.addClass("notice_bar");
			noticeBar.addClass(check.state === "pass" ? "notice_bar_pass" : check.state === "fail" ? "notice_bar_fail" : "notice_bar_warn");
			noticeBar.append($("<div class='notice_bar_left'>"));
			var noticeContent = $("<div class='notice_content'>").appendTo(noticeBar);
			renderNoticeContent(noticeContent, info, check);
			var dismissDiv = $("<div class='notice_bar_right'>").appendTo(noticeBar);
			if (check.state === "fail") return;	// cannot dismiss errors
			var dismiss = $("<div class='notice_bar_dismiss'>").appendTo(dismissDiv);
			dismiss.append("Dismiss");
			dismiss.click(function() {
				dismissed[check.code] = check.state;
				noticeBar.detach();
			});
			
			function renderNoticeContent(noticeContent, info, check) {
				var noticeIcon = check.state === "pass" ? $("<img src='img/checkmark_small.png'>") : $("<img src='img/warning.png'>");
				noticeIcon.addClass("notice_icon");
				noticeContent.append(noticeIcon);
				
				// interpret environment code and state
				switch (check.code) {
				case AppUtils.EnvironmentCode.BROWSER_SUPPORTED:
					if (check.state === "fail") noticeContent.append("Browser is not supported (" + info.browser.name + " " + info.browser.version + ")");
					break;
				case AppUtils.EnvironmentCode.RUNTIME_ERROR:
					if (check.state === "fail") noticeContent.append("Unexpected runtime error: " + info.runtimeError);
					break;
				case AppUtils.EnvironmentCode.IS_ONLINE:
					if (check.state === "pass") noticeContent.append("No internet connection");
					else noticeContent.append("Internet connection is active");
					break;
				case AppUtils.EnvironmentCode.IS_LOCAL:
					if (check.state === "pass") noticeContent.append("Application is running locally");
					else noticeContent.append("Application is not running locally");
					break;
				case AppUtils.EnvironmentCode.INTERNET_REQUIRED:
					if (check.state === "fail") noticeContent.append("Internet is required because application is not running locally");
					break;
				case AppUtils.EnvironmentCode.OPEN_SOURCE_BROWSER:
					if (check.state === "pass") noticeContent.append("Browser is open source (" + info.browser.name + ")");
					else noticeContent.append("Browser is not open source (" + info.browser.name + ")");
					break;
				case AppUtils.EnvironmentCode.OPEN_SOURCE_OS:
					if (check.state === "pass") noticeContent.append("Operating system is open source (" + info.os.name + ")");
					else noticeContent.append("Operating system is not open source (" + info.os.name + ")");
					break;
				case AppUtils.EnvironmentCode.PRERELEASE:
					if (check.state === "warn") noticeContent.append("Application is under development.  Not ready for use.");
					break;
				default:
					throw new Error("Unrecognized environment code: " + check.code);
				}
			}
		}
	}
}
inheritsFrom(NoticeController, DivController);
