/**
 * MIT License
 * 
 * Copyright (c) 2018 cryptostorage
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * Operating systems separate so AppUtils can reference.
 */
var OperatingSystems = {
		LINUX: [
			"Linux", "CentOS", "Debian", "Fedora", "Linux Mint", "Mint", "RedHat", "Red Hat", "SuSE", "Ubuntu", "Xubuntu",
			"PCLinuxOS", "VectorLinux", "Zenwalk", "GNU"
		],
		OSX: ["Mac OS", "Mac OS X", "Macintosh", "Mac"],
		WINDOWS: ["Windows Phone", "Windows 98;", "Windows 98", "Windows", "Windows ", "Windows Phone", "Windows Mobile"],
}

/**
 * Collection of utilities and constants for cryptostorage.com.
 */
var AppUtils = {
		
	// app constants
	VERSION: "0.1.1",
	VERSION_POSTFIX: " beta",
	RUN_MIN_TESTS: true,
	RUN_FULL_TESTS: false,
	DEV_MODE: true,
	DELETE_WINDOW_CRYPTO: false,
	VERIFY_ENCRYPTION: false,
	ENCRYPTION_THREADS: 1,
	MIN_PASSWORD_LENGTH: 7,
	CRYPTOSTORAGE_URL: "https://cryptostorage.com",
	ONLINE_IMAGE_URL: "https://cryptostorage.com/favicon.ico",
	ENVIRONMENT_REFRESH_RATE: 8000,		// environment refresh rate in milliseconds
	ONLINE_DETECTION_TIMEOUT: 8000,		// timeout to detect if online
	SLIDER_RATE: 4000,								// rate of slider transitions
	NO_INTERNET_CAN_BE_ERROR: false,	// lack of internet can be critical error if running remotely
	SIMULATED_LOAD_TIME: null,				// simulate slow load times in ms, disabled if null
	IGNORE_HASH_CHANGE: false,				// specifies that the browser should ignore hash changes
	
	/**
	 * Mock environment checks.
	 */
	MOCK_ENVIRONMENT_ENABLED: false,
	MOCK_ENVIRONMENT: {
		browser: {name: "Firefox", version: "42.0", major: 42, isOpenSource: true, isSupported: true, windowCryptoExists: true},
		os: {name: "Linux", version: "10.12", isOpenSource: true},
		isLocal: true,
		isOnline: false,
	},
	
	// classify operating systems and browsers as open or closed source
	OPEN_SOURCE_BROWSERS: [
		"Firefox", "Chromium", "Tizen", "Epiphany", "K-Meleon", "SeaMonkey", "SlimerJS", "Arora", "Breach", "Camino",
		"Electron", "Fennec", "Konqueror", "Midori", "PaleMoon", "Rekonq", "Sunrise", "Waterfox", "Amaya", "Bowser",
		"Camino"
	],
	CLOSED_SOURCE_BROWSERS: [
		"Chrome", "Chrome WebView", "Chrome Mobile", "Safari", "Opera", "Opera Mini", "Samsung Internet for Android",
		"Samsung Internet", "Opera Coast", "Yandex Browser", "UC Browser", "Maxthon", "Puffin", "Sleipnir",
		"Windows Phone", "Internet Explorer", "Microsoft Edge", "IE", "Vivaldi", "Sailfish", "Amazon Silk", "Silk",
		"PhantomJS", "BlackBerry", "WebOS", "Bada", "Android", "iPhone", "iPad", "iPod", "Googlebot", "Adobe AIR", "Avant",
		"Avant Browser", "Flock", "Galeon", "GreenBrowser", "iCab", "Lunascape", "Maxthon", "Nook Browser", "Raven",
		"RockMelt", "SlimBrowser", "SRWare Iron", "Swiftfox", "WebPositive", "Android Browser", "Baidu", "Blazer",
		"Comodo Dragon", "Dolphin", "Edge", "iCab", "IE Mobile", "IEMobile", "Kindle", "WeChat", "Yandex"
	],
	OPEN_SOURCE_OPERATING_SYSTEMS: [].concat(OperatingSystems.LINUX),
	CLOSED_SOURCE_OPERATING_SYSTEMS: [
		"Android", "Chrome OS", "Cygwin", "hpwOS", "Tablet OS", "AIX", "Amiga OS", "Bada", "BeOS", "BlackBerry", "Hurd", "Linpus",
		"Mandriva", "Morph OS", "OpenVMS", "OS/2", "QNX", "RIM Tablet OS", "Sailfish", "Series40", "Solaris", "Symbian", "WebOS",
		"iOS", "FreeBSD", "Gentoo", "Haiku", "Kubuntu", "OpenBSD", "Symbian OS", "webOS", "webOS", "Tizen", "Chromium OS",
		"Contiki", "DragonFly", "Joli", "Mageia", "MeeGo", "Minix", "NetBSD", "Plan9" 
	].concat(OperatingSystems.OSX).concat(OperatingSystems.IOS).concat(OperatingSystems.WINDOWS),
	
	// ------------------------- APPLICATION DEPENDENCIES -----------------------
	
	getHomeDependencies: function() {
		var dependencies = [
			"lib/slick.js",
			"css/slick.css",
			"img/cryptostorage_white.png",
			"img/cryptocurrency.png",
			"img/printer.png",
			"img/security.png",
			"img/microscope.png",
			"img/keys.png",
			"img/checklist.png",
			"img/passphrase_input.png",
			"img/split_input.png",
			"img/print_example.png",
			"img/notice_bars.png",
			"img/key.png",
			"img/mit.png",
			"img/github.png",
		];
		
		// crypto logos
		for (var i = 0; i < AppUtils.getCryptoPlugins().length; i++) {
			dependencies.push(AppUtils.getCryptoPlugins()[i].getLogoPath());
		}
		
		return dependencies;
	},
	
	getNoticeDependencies: function() {
		return [
			"lib/setImmediate.js",
			"lib/ua-parser.js",
			"lib/popper.js",
			"lib/tippy.all.js",
			"img/skull.png",
			"img/internet.png",
			"img/browser.png",
			"img/computer.png",
			"img/download.png",
			"img/circle_checkmark.png",
			"img/circle_exclamation.png",
			"img/circle_x.png"
		];
	},
	
	getCryptoDependencies: function() {
		var dependencies = [];
		dependencies.push("lib/crypto-js.js");
		dependencies.push("lib/bitcoinjs.js");
		var plugins = AppUtils.getCryptoPlugins();
		for (var i = 0; i < plugins.length; i++) {
			dependencies = dependencies.concat(plugins[i].getDependencies());
			dependencies.push(plugins[i].getLogoPath());
		}
		return dependencies;
	},
	
	getExportJs: function() {
		return [
			"lib/jquery-3.2.1.js",
			"lib/async.js",
			"lib/loadjs.js",
			"js/DependencyLoader.js",
			"js/GenUtils.js",
			"js/AppUtils.js",
			"js/DivControllers.js",
			"js/CryptoPlugins.js",
			"js/BodyExporter.js",
			"lib/pagination.js"
		];
	},
	
	getExportCss: function() {
		return [
			"css/style.css",
			"css/pagination.css"
		]
	},

	getExportDependencies: function() {
		var dependencies = [
			"css/pagination.css",
			"lib/pagination.js",
			"js/PieceRenderer.js",
			"lib/qrcode.js",
			"lib/jszip.js",
			"lib/FileSaver.js",
			"lib/crypto-js.js",
			"lib/progressbar.js",
			"lib/bitaddress.js",
			"lib/clipboard.js",
			"lib/polyfill.js",
			"js/CryptoKey.js",
			"lib/setImmediate.js",
			"img/cryptostorage_export.png",
			"img/restricted.png",
			"img/refresh.png"
		];
		
		// add dependencies
		dependencies = dependencies.concat(AppUtils.getCryptoDependencies());
		dependencies = dependencies.concat(AppUtils.getNoticeDependencies());
		
		// return unique array
		return toUniqueArray(dependencies);
	},
	
	// return all faq dependencies
	getFaqDependencies: function() {
		return [
			"lib/setImmediate.js",
			"img/key_pair.png",
			"img/notice_bar_pass.png"
		];
	},
	
	// returns all app dependencies after inital homescreen is loaded
	getAppDependencies: function() {

		// app dependencies
		var dependencies = [
			"lib/setImmediate.js",
			"css/pagination.css",
			"lib/pagination.js",
			"js/PieceRenderer.js",
			"lib/qrcode.js",
			"lib/jszip.js",
			"lib/FileSaver.js",
			"lib/crypto-js.js",
			"lib/progressbar.js",
			"lib/bitaddress.js",
			"lib/clipboard.js",
			"js/CryptoKey.js",
			"js/Tests.js",
			"js/BodyExporter.js",
			"lib/jquery.ddslick.js",
			"img/loading.gif",
			"img/information.png",
			"img/trash.png",
			"img/qr_code.png",
			"img/split_lines_2.png",
			"img/split_lines_3.png",
			"img/file.png",
			"img/files.png",
			"img/warning.png",
			"img/checkmark.png",
			"img/drag_and_drop.png",
			"img/bitpay.png",
			"img/ethereumjs.png"
		];
		
		// add dependencies
		dependencies = dependencies.concat(AppUtils.getCryptoDependencies());
		dependencies = dependencies.concat(AppUtils.getNoticeDependencies());
		dependencies = dependencies.concat(AppUtils.getExportDependencies());
		
		// return unique array
		return toUniqueArray(dependencies);
	},
	
	/**
	 * Returns all crypto plugins.
	 */
	getCryptoPlugins: function() {
		if (!AppUtils.plugins) {
			AppUtils.plugins = [];
			AppUtils.plugins.push(new BitcoinCashPlugin());
			AppUtils.plugins.push(new EthereumPlugin());
			AppUtils.plugins.push(new MoneroPlugin());
			AppUtils.plugins.push(new BitcoinPlugin());
			AppUtils.plugins.push(new LitecoinPlugin());
			AppUtils.plugins.push(new OmiseGoPlugin());
			AppUtils.plugins.push(new DashPlugin());
			AppUtils.plugins.push(new ZcashPlugin());
			AppUtils.plugins.push(new BasicAttentionTokenPlugin());
			AppUtils.plugins.push(new EthereumClassicPlugin());
			AppUtils.plugins.push(new UbiqPlugin());
		}
		return AppUtils.plugins;
	},
	
	/**
	 * Returns the crypto plugin with the given ticker symbol.
	 */
	getCryptoPlugin: function(ticker) {
		assertInitialized(ticker);
		var plugins = AppUtils.getCryptoPlugins();
		for (var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			if (plugin.getTicker() === ticker) return plugin;
		}
		throw new Error("No plugin found for crypto '" + ticker + "'");
	},
		
	/**
	 * Enumerates passphrase encryption/decryption schemes.
	 */
	EncryptionScheme: {
		BIP38: "BIP38",
		CRYPTOJS: "CryptoJS",
		SJCL: "SJCL"
	},
	
	/**
	 * Determines if the given string is a valid CryptoJS WIF private key.
	 */
	isWifCryptoJs: function(str) {
		return str.startsWith("U2") && (str.length === 128 || str.length === 108) && !hasWhitespace(str);
	},
	
	/**
	 * Determines if the given string is base58.
	 */
	isBase58: function(str) {
		return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/.test(str)
	},
	
	/**
	 * Determines if the given string is a possible split piece of a private key (cannot be excluded as one).
	 * 
	 * A piece must be at least 47 characters and base58 encoded.
	 * 
	 * @returns true if the given string meets the minimum requirements to be a split piece
	 */
	isPossibleSplitPiece: function(str) {
		return isString(str) && str.length >= 47 && AppUtils.isBase58(str) && isNumber(AppUtils.getMinPieces(str));
	},
	
	/**
	 * Returns the version numbers from a string of the format NN.NN.NN.
	 * 
	 * @param str is the string to get the version numbers from
	 * 
	 * @returns int[3] with the three version numbers
	 */
	getVersionNumbers: function(str) {
		var dotIdx1 = str.indexOf('.');
		if (dotIdx1 < 0) throw new Error("Version does not have dot separator: " + str);
		var dotIdx2 = str.indexOf('.', dotIdx1 + 1);
		if (dotIdx2 < 0) throw new Error("Version does not have two dot separators: " + str);
		if (str.indexOf('.', dotIdx2 + 1) >= 0) throw new Error("Version has more than 2 dot separators: " + str);
		var nums = [];
		nums.push(Number(str.substring(0, dotIdx1)));
		nums.push(Number(str.substring(dotIdx1 + 1, dotIdx2)));
		nums.push(Number(str.substring(dotIdx2 + 1)));
		for (var i = 0; i < nums.length; i++) {
			assertNumber(nums[i], "Version element " + i + " is not a number");
			assertTrue(nums[i] >= 0, "Version element " + i + " + is negative");
		}
		assertTrue(nums[0] + nums[1] + nums[2] > 0, "Version does not have positive element: " + str);
		return nums;
	},
	
	/**
	 * Determines the minimum pieces to reconstitute based on a possible split piece string.
	 * 
	 * Looks for 'XXXc' prefix in the given split piece where XXX is the minimum to reconstitute.
	 * 
	 * @param splitPiece is a string which may be prefixed with 'XXXc...'
	 * @return the minimum pieces to reconstitute if prefixed, null otherwise
	 */
	getMinPieces: function(splitPiece) {
		assertString(splitPiece);
		var idx = splitPiece.indexOf('c');	// look for first lowercase 'c'
		if (idx <= 0) return null;
		return Number(splitPiece.substring(0, idx)); // parse preceding numbers to int
	},

	/**
	 * Splits the given string.  First converts the string to hex.
	 * 
	 * @param str is the string to split
	 * @param numPieces is the number of pieces to make
	 * @param minPieces is the minimum number of pieces to reconstitute
	 * @returns string[] are the pieces
	 */
	splitString: function(str, numPieces, minPieces) {
		return secrets.share(secrets.str2hex(str), numPieces, minPieces);
	},

	/**
	 * Reconstitutes the given pieces.  Assumes the pieces reconstitute hex which is converted to a string.
	 * 
	 * @param pieces are the pieces to reconstitute
	 * @return string is the reconstituted string
	 */
	reconstitute: function(pieces) {
		return secrets.hex2str(secrets.combine(pieces));
	},

	// specifies default QR configuration
	DefaultQrConfig: {
		version: null,
		errorCorrectionLevel: 'Q',
		margin: 0,
		scale: null
	},

	/**
	 * Renders a QR code to an image.
	 * 
	 * @param text is the text to codify
	 * @param config specifies configuration options
	 * @param callback will be called with the image node after creation
	 */
	renderQrCode: function(text, config, callback) {
		
		// merge configs
		config = Object.assign({}, AppUtils.DefaultQrConfig, config);

		// generate QR code
		var segments = [{data: text, mode: 'byte'}];	// manually specify mode
		qrcodelib.toDataURL(segments, config, function(err, url) {
			if (err) throw err;
			var img = $("<img>");
			if (config.size) img.css("width", config.size + "px");
			if (config.size) img.css("height", config.size + "px");
			img[0].onload = function() {
				img[0].onload = null;	// prevent re-loading
				callback(img);
			}
			img[0].src = url;
		});
	},
	
	/**
	 * Applies the given config to the given keys.
	 * 
	 * config.includePublic specifies if public keys should be included
	 * config.includePrivate specifies if private keys should be included
	 */
	applyKeyConfig: function(keys, config) {
		
		// merge config with default
		config = Object.assign({}, getDefaultConfig(), config);
		function getDefaultConfig() {
			return {
				includePublic: true,
				includePrivate: true
			};
		}
		
		if (!config.includePublic) {
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				delete key.getState().address;
			}
		}
		
		if (!config.includePrivate) {
			for (var i = 0; i < keys.length; i++) {
				var key = keys[i];
				delete key.getState().hex;
				delete key.getState().wif;
				delete key.getState().encryption;
			}
		}
	},

	/**
	 * Attempts to construct a key from the given string.  The string is expected to be a
	 * single private key (hex or wif, encrypted or unencrypted) or one or more pieces that
	 * reconstitute a single private key (hex or wif, encrypted or unencrypted).
	 * 
	 * @param plugin in the coin plugin used to parse the string
	 * @param str is the string to parse into a key
	 * @returns a key parsed from the given string
	 * @throws an exception if a private key cannot be parsed from the string
	 */
	parseKey: function(plugin, str) {
		assertInitialized(str);
		str = str.trim();
		if (!str) return null;
		
		// first try string as key
		try {
			return plugin.newKey(str);
		} catch (err) {

			// try tokenizing and combining
			var tokens = getTokens(str);
			if (tokens.length === 0) return null;
			try {
				return plugin.combine(tokens);
			} catch (err) {
				return null;	// error means key could not be parsed
			}
		}
	},
	
	/**
	 * Attempts to get a key from the given strings.
	 * 
	 * @param plugin is the currency plugin to parse the strings to a key
	 * @param strings is expected to be a private key or pieces
	 * @return CryptoKey if possible, null otherwise
	 */
	getKey: function(plugin, strs) {
		
		// validate input
		assertInitialized(strs);
		assertTrue(strs.length > 0);
		
		// parse single string
		if (strs.length === 1) {
			try {
				return plugin.newKey(strs[0]);
			} catch (err) {
				return null;
			}
		}
		
		// parse multiple strings
		else {
			try {
				return plugin.combine(strs);
			} catch (err) {
				return null;
			}
		}
	},

	/**
	 * Converts the given keys to pieces.
	 * 
	 * @param keys are the keys to convert to pieces
	 * @param numPieces are the number of pieces to split the keys into (must be >= 1)
	 * @param minPieces are the minimum pieces to reconstitute the keys (optional)
	 * @returns exportable pieces
	 */
	keysToPieces: function(keys, numPieces, minPieces) {
		
		// validate input
		assertTrue(keys.length > 0);
		if (!isDefined(numPieces)) numPieces = 1;
		assertTrue(numPieces >= 1, "Number of pieces must be >= 1");
		if (minPieces) {
			assertTrue(numPieces >= 2, "Number of pieces must be >= 2");
			assertTrue(minPieces >= 2, "Minimum pieces must be >= 2");
			assertTrue(minPieces <= numPieces, "Minimum pieces must be <= number of pieces");
		}
		
		// initialize pieces
		var pieces = [];
		for (var i = 0; i < numPieces; i++) {
			var piece = {};
			if (numPieces > 1) piece.pieceNum = i + 1;
			piece.version = AppUtils.VERSION;
			piece.keys = [];
			pieces.push(piece);
		}
		
		// add keys to each piece
		for (var i = 0; i < keys.length; i++) {
			var key = keys[i];
			if (!key.getWif() && !key.getHex() && numPieces > 1) throw new Error("Cannot split piece without private key");
			var keyPieces = numPieces > 1 ? key.getPlugin().split(key, numPieces, minPieces) : [key.getWif()];
			for (var j = 0; j < numPieces; j++) {
				var pieceKey = {};
				pieceKey.ticker = key.getPlugin().getTicker();
				pieceKey.address = key.getAddress();
				pieceKey.wif = keyPieces[j];
				if (pieceKey.wif) pieceKey.encryption = key.getEncryptionScheme();
				pieces[j].keys.push(pieceKey);
			}
		}
		
		return pieces;
	},

	/**
	 * Converts the given pieces to keys.
	 * 
	 * @param pieces are the pieces to convert to keys
	 * @returns keys built from the pieces
	 */
	piecesToKeys: function(pieces) {
		assertTrue(pieces.length > 0);
		var keys = [];
		
		// handle one piece
		if (pieces.length === 1) {
			assertTrue(pieces[0].keys.length > 0);
			if (pieces[0].pieceNum && pieces[0].keys[0].wif) {
				var minPieces = AppUtils.getMinPieces(pieces[0].keys[0].wif);
				var additional = minPieces - 1;
				throw new Error("Need " + additional + " additional " + (additional === 1 ? "piece" : "pieces") + " to import private keys");
			}
			for (var i = 0; i < pieces[0].keys.length; i++) {
				var pieceKey = pieces[0].keys[i];
				var state = {};
				state.address = pieceKey.address;
				state.wif = pieceKey.wif;
				state.encryption = pieceKey.encryption;
				var key = new CryptoKey(AppUtils.getCryptoPlugin(pieceKey.ticker), state.wif ? state.wif : state);
				if (key.hasPrivateKey() && key.isEncrypted() && pieceKey.address) key.setAddress(pieceKey.address);	// set address because it cannot be derived from encrypted key
				keys.push(key);
			}
		}
		
		// handle multiple pieces
		else {
			
			// validate pieces contain same number of keys
			var numKeys;
			for (var i = 0; i < pieces.length; i++) {
				var piece = pieces[i];
				if (!numKeys) numKeys = piece.keys.length;
				else if (numKeys !== piece.keys.length) throw new Error("Pieces contain different number of keys");
			}
			
			// validate consistent keys across pieces
			var minPieces;
			for (var i = 0; i < pieces[0].keys.length; i++) {
				var crypto = null;
				var address = null;
				var encryption = null;
				for (var j = 0; j < pieces.length; j++) {
					var piece = pieces[j];
					if (!crypto) crypto = piece.keys[i].ticker;
					else if (crypto !== piece.keys[i].ticker) throw new Error("Pieces are for different cryptocurrencies");
					if (!address) address = piece.keys[i].address;
					else if (address !== piece.keys[i].address) throw new Error("Pieces have different addresses");
					if (!encryption) encryption = piece.keys[i].encryption;
					else if (encryption !== piece.keys[i].encryption) throw new Error("Pieces have different encryption states");
					if (pieces[j].keys[i].wif) {
						if (!minPieces) minPieces = AppUtils.getMinPieces(piece.keys[i].wif);
						else if (minPieces !== AppUtils.getMinPieces(piece.keys[i].wif)) throw new Error("Pieces have different minimum threshold prefixes");
					}
				}
			}
			
			// check if minimum threshold met
			if (minPieces && pieces.length < minPieces) {
				var additional = minPieces - pieces.length;
				throw new Error("Need " + additional + " additional " + (additional === 1 ? "piece" : "pieces") + " to import private keys");
			}
			
			// combine keys across pieces
			try {
				for (var i = 0; i < pieces[0].keys.length; i++) {
					if (pieces[0].keys[i].wif) {
						var shares = [];
						for (var j = 0; j < pieces.length; j++) {
							var piece = pieces[j];
							shares.push(piece.keys[i].wif);
						}
						var key = AppUtils.getCryptoPlugin(pieces[0].keys[i].ticker).combine(shares);
						if (key.isEncrypted() && pieces[0].keys[i].address) key.setAddress(pieces[0].keys[i].address);
						keys.push(key);
					} else {
						keys.push(new CryptoKey(AppUtils.getCryptoPlugin(pieces[0].keys[i].ticker), {address: pieces[0].keys[i].address}));
					}
				}
			} catch (err) {
				throw new Error("Could not import private keys from the given pieces.  Verify the pieces are correct.");
			}
		}

		return keys;
	},

	/**
	 * Zips the given pieces.
	 * 
	 * @param pieces are the pieces to zip
	 * @param callback(blob) is invoked when zipping is complete
	 */
	piecesToZip: function(pieces, callback) {
		assertTrue(pieces.length > 0, "Pieces cannot be empty");
		
		// get common ticker
		var ticker = AppUtils.getCommonTicker(pieces[0]).toLowerCase();
		
		// prepare zip
		var zip = JSZip();
		for (var i = 0; i < pieces.length; i++) {
			var name = "cryptostorage_" + ticker + (pieces.length > 1 ? "_piece_" + (i + 1) : "");
			zip.file(name + ".json", AppUtils.pieceToJson(pieces[i]));
		}
		
		// create zip
		zip.generateAsync({type:"blob"}).then(function(blob) {
			callback(blob);
		});
	},

	/**
	 * Extracts pieces from a zip blob.
	 * 
	 * @param blob is the raw zip data
	 * @param onPieces(namedPieces) is called when all pieces have been extracted
	 */
	zipToPieces: function(blob, onPieces) {
		
		// load zip asynchronously
		JSZip.loadAsync(blob).then(function(zip) {
			
			// collect callback functions to get pieces
			var funcs = [];
			zip.forEach(function(path, zipObject) {
				if (path.startsWith("_")) return;
				if (path.endsWith(".json")) {
					funcs.push(getPieceCallbackFunction(zipObject));
				} else if (path.endsWith(".zip")) {
					funcs.push(getZipCallbackFunction(zipObject));
				}
			});
			
			// invoke callback functions to get pieces
			async.parallel(funcs, function(err, args) {
				if (err) throw err;
				var pieces = [];
				for (var i = 0; i < args.length; i++) {
					var arg = args[i];
					if (isArray(arg)) {
						for (var j = 0; j < arg.length; j++) pieces.push(arg[j]);
					}
					else pieces.push(arg);
				}
				onPieces(pieces);
			});
		});
		
		function getPieceCallbackFunction(zipObject) {
			return function(onPiece) {
				zipObject.async("string").then(function(str) {
					var piece;
					try {
						piece = JSON.parse(str);
						AppUtils.validatePiece(piece, true);
					} catch (err) {
						//throw err;
						console.log(err);
					}
					onPiece(null, {name: zipObject.name, piece: piece});
				});
			}
		}
		
		function getZipCallbackFunction(zipObject) {
			return function(callback) {
				zipObject.async("blob").then(function(blob) {
					AppUtils.zipToPieces(blob, function(pieces) {
						callback(null, pieces);
					});
				});
			}
		}
	},

	pieceToCsv: function(piece) {
		assertTrue(piece.keys.length > 0);
		
		// build csv header
		var csvHeader = [];
		for (var prop in piece.keys[0]) {
	    if (piece.keys[0].hasOwnProperty(prop)) {
	    	csvHeader.push(prop.toString().toUpperCase());
	    }
		}
		
		// build csv
		var csvArr = [];
		csvArr.push(csvHeader);
		for (var i = 0; i < piece.keys.length; i++) {
			var key = piece.keys[i];
			var csvKey = [];
			for (var prop in key) {
				csvKey.push(isInitialized(key[prop]) ? key[prop] : "");
			}
			csvArr.push(csvKey);
		}
	
		// convert array to csv
		return arrToCsv(csvArr);
	},
	
	pieceToJson: function(piece, config) {
		return JSON.stringify(piece);
	},
	
	/**
	 * Transforms the given piece according to the given configuration.
	 * 
	 * @param piece is the piece to transform
	 * @param config specifies how to modify the piece
	 * 				config.showPublic will include public addresses if undefined or true, excluded otherwise
	 * 				config.showPrivate will include private addresses if undefined or true, excluded otherwise
	 * @returns a new piece with the given configuration applied
	 */
	transformPiece: function(piece, config) {
		config = Object.assign(getDefaultConfig(), config);
		var copy = JSON.parse(JSON.stringify(piece));
		for (var i = 0; i < copy.keys.length; i++) {
			var key = copy.keys[i];
			if (!config.showPublic) delete key.address;
			if (!config.showPrivate) delete key.wif;
		}
		return copy;
		
		function getDefaultConfig() {
			return {
				showPublic: true,
				showPrivate: true
			}
		}
	},

	pieceToStr: function(piece) {
		var str = "";
		for (var i = 0; i < piece.keys.length; i++) {
			str += "===== #" + (i + 1) + " " + AppUtils.getCryptoPlugin(piece.keys[i].ticker).getName() + " =====\n\n";
			if (piece.keys[i].address) str += "Public Address:\n" + piece.keys[i].address + "\n\n";
			if (piece.keys[i].wif) str += "Private Key " + (piece.pieceNum ? "(split)" : (piece.keys[i].encryption ? "(encrypted)" : "(unencrypted)")) + ":\n" + piece.keys[i].wif + "\n\n";
		}
		return str.trim();
	},
	
	pieceToAddresses: function(piece) {
		var str = "";
		for (var i = 0; i < piece.keys.length; i++) {
			str += "===== #" + (i + 1) + " " + AppUtils.getCryptoPlugin(piece.keys[i].ticker).getName() + " =====\n\n";
			if (piece.keys[i].address) str += "Public Address:\n" + piece.keys[i].address + "\n" + piece.keys[i].address + "\n\n";
		}
		return str.trim();
	},

	/**
	 * Validates the given piece.
	 * 
	 * @param piece is the piece to validate
	 * @param allowMissingPublicXorPrivate specifies if publics xor privates can be omitted
	 * @throws an exception if the piece is not valid
	 */
	validatePiece: function(piece, allowMissingPublicXorPrivate) {
		assertDefined(piece.version, "piece.version is not defined");
		if (piece.version === "1.0") piece.version = "0.0.1";	// hack for backwards compatibility of pieces that already exist
		try {
			AppUtils.getVersionNumbers(piece.version);
		} catch (err) {
			throw new Error("piece.version is invalid version string: " + piece.version);
		}
		
		if (isDefined(piece.pieceNum)) {
			assertInt(piece.pieceNum, "piece.pieceNum is not an integer");
			assertTrue(piece.pieceNum > 0, "piece.pieceNum is not greater than 0");
		}
		assertDefined(piece.keys, "piece.keys is not defined");
		assertArray(piece.keys, "piece.keys is not an array");
		assertTrue(piece.keys.length > 0, "piece.keys is empty");
		var minPieces;
		for (var i = 0; i < piece.keys.length; i++) {
			assertDefined(piece.keys[i].ticker, "piece.keys[" + i + "].ticker is not defined");
			assertDefined(piece.keys[i].encryption, "piece.keys[" + i + "].encryption is not defined");
			if (allowMissingPublicXorPrivate) {
				if (!isDefined(piece.keys[i].address) && !isDefined(piece.keys[i].wif)) throw new Error("piece.keys[" + i + "] is missing an address and private key");
			} else {
				assertDefined(piece.keys[i].address, "piece.keys[" + i + "].address is not defined");
				assertDefined(piece.keys[i].wif, "piece.keys[" + i + "].wif is not defined");
			}
			if (piece.pieceNum && piece.keys[i].wif) {
				if (!minPieces) minPieces = AppUtils.getMinPieces(piece.keys[i].wif);
				else if (minPieces !== AppUtils.getMinPieces(piece.keys[i].wif)) throw new Error("piece.keys[" + i + "].wif has a different minimum threshold prefix");
			}
		}
	},
	
	getCommonTicker: function(piece) {
		assertTrue(piece.keys.length > 0);
		var ticker;
		for (var i = 0; i < piece.keys.length; i++) {
			var pieceKey = piece.keys[i];
			if (!ticker) ticker = pieceKey.ticker;
			else if (ticker !== pieceKey.ticker) return "mix";
		}
		return ticker;
	},
	
	/**
	 * Returns a version of the string up to the given maxLength characters.
	 * 
	 * If the string is longer than maxLength, shortens the string by replacing middle characters with '...'.
	 * 
	 * @param str is the string to shorten
	 * @param maxLength is the maximum length of the string
	 * @return the given str if str.length <= maxLength, shortened version otherwise
	 */
	getShortenedString: function(str, maxLength) {
		assertString(str);
		if (str.length <= maxLength) return str;
		var insert = '...';
		var sideLength = Math.floor((maxLength - insert.length) / 2);
		if (sideLength === 0) throw new Error("Cannot create string of length " + maxLength + " from string '" + str + "'");
		return str.substring(0, sideLength) + insert + str.substring(str.length - sideLength);
	},
	
	/**
	 * Generates keys, pieces, rendered pieces according to a configuration.
	 * 
	 * @param config is the key generation configuration:
	 * 	{
	 * 		currencies: [{ticker: _, numKeys: _, encryption: _}, ...],
	 * 		numPieces: _,
	 * 		minPieces: _,
	 * 		verifyEnryption: true|false	
	 * 		passphrase: _,	// only needed if currency encryption initialized
	 * 	}
	 * @param onProgress(percent, label) is invoked as progress is made (optional)
	 * @param onDone(err, keys, pieces, pieceDivs) is invoked when done
	 * @param noInternetIsNotErrorAfterDependenciesLoaded makes lack of internet a non-error even if remote after dependencies are loaded (used on export page)
	 */
	generateKeys: function(config, onProgress, onDone, noInternetIsNotErrorAfterDependenciesLoaded) {
		
		// verify config
		try {
			assertInitialized(config.currencies);
			assertTrue(config.currencies.length > 0);
			var encryptionInitialized = false;
			for (var i = 0; i < config.currencies.length; i++) {
				assertInitialized(config.currencies[i].ticker);
				assertInitialized(config.currencies[i].numKeys);
				assertDefined(config.currencies[i].encryption);
				if (isInitialized(config.currencies[i].encryption)) encryptionInitialized = true;
			}
			assertInitialized(config.numPieces);
			if (encryptionInitialized) assertInitialized(config.passphrase);
		} catch (err) {
			onDone(err);
		}
		
		// track done and total weight for progress
		var doneWeight = 0;
		var totalWeight = AppUtils.getWeightGenerateKeys(config);

		// load dependencies
		var dependencies = [];
		for (var i = 0; i < config.currencies.length; i++) {
			var currency = config.currencies[i];
			var pluginDependencies = AppUtils.getCryptoPlugin(currency.ticker).getDependencies();
			for (var j = 0; j < pluginDependencies.length; j++) {
				dependencies.push(pluginDependencies[j]);
			}
		}
		dependencies = toUniqueArray(dependencies);
		if (onProgress) onProgress(0, "Loading dependencies");
		LOADER.load(dependencies, function() {
			
			// internet is no longer required if accessing remotely
			if (noInternetIsNotErrorAfterDependenciesLoaded) AppUtils.setNoInternetCanBeError(false);
			
			// collect key creation functions
			var funcs = [];
			for (var i = 0; i < config.currencies.length; i++) {
				var currency = config.currencies[i];
				for (var j = 0; j < currency.numKeys; j++) {
					funcs.push(newKeyFunc(AppUtils.getCryptoPlugin(currency.ticker)));
				}
			}
			
			// generate keys
			if (onProgress) onProgress(doneWeight / totalWeight, "Generating keys");
			async.series(funcs, function(err, keys) {
				try {
					
					// check for error
					if (err) throw err;
					
					// collect encryption schemes
					var encryptionSchemes = [];
					for (var i = 0; i < config.currencies.length; i++) {
						var currency = config.currencies[i];
						for (var j = 0; j < currency.numKeys; j++) {
							if (currency.encryption) encryptionSchemes.push(currency.encryption);
						}
					}
					
					// encrypt keys
					if (encryptionSchemes.length > 0) {
						assertEquals(keys.length, encryptionSchemes.length);
						
						// compute encryption + verification weight
						var encryptWeight = 0;
						for (var i = 0; i < encryptionSchemes.length; i++) {
							encryptWeight += AppUtils.getWeightEncryptKey(encryptionSchemes[i]) + (config.verifyEncryption ? AppUtils.getWeightDecryptKey(encryptionSchemes[i]) : 0);
						}
						
						// start encryption
						if (onProgress) onProgress(doneWeight / totalWeight, "Encrypting");
						AppUtils.encryptKeys(keys, encryptionSchemes, config.passphrase, config.verifyEncryption, function(percent, label) {
							if (onProgress) onProgress((doneWeight + percent * encryptWeight) / totalWeight, label);
						}, function(err, encryptedKeys) {
							if (err) onDone(err);
							else {
								doneWeight += encryptWeight;
								generatePieces(encryptedKeys, config);
							}
						});
					}
					
					// no encryption
					else {
						generatePieces(keys, config);
					}
				} catch (err) {
					onDone(err);
				}
			});
		});
		
		function newKeyFunc(plugin, onDone) {
			return function(onDone) {
				setImmediate(function() {	// let UI breath
					try {
						var key = plugin.newKey();
					} catch(err) {
						onDone(err);
					}
					doneWeight += AppUtils.getWeightCreateKey();
					if (onProgress) onProgress(doneWeight / totalWeight, "Generating keys");
					onDone(null, key);
				});
			}
		}
		
		function generatePieces(keys, config) {
			try {
				
				// convert keys to pieces
				var pieces = AppUtils.keysToPieces(keys, config.numPieces, config.minPieces);
				
				// verify pieces recreate keys
				var keysFromPieces = AppUtils.piecesToKeys(pieces);
				assertEquals(keys.length, keysFromPieces.length);
				for (var i = 0; i < keys.length; i++) {
					assertTrue(keys[i].equals(keysFromPieces[i]));
				}
				
				// render pieces to divs
				var renderWeight = PieceRenderer.getWeight(keys.length, config.numPieces, null);
				if (onProgress) onProgress(doneWeight / totalWeight, "Rendering");
				new PieceRenderer(pieces, null, null).render(function(percent) {
					if (onProgress) onProgress((doneWeight + percent * renderWeight) / totalWeight, "Rendering");
				}, function(err, pieceDivs) {
					try {
						if (err) throw err;
						assertEquals(pieces.length, pieceDivs.length);
						if (onProgress) onProgress(1, "Complete");
						onDone(null, keys, pieces, pieceDivs);
					} catch (err) {
						onDone(err);
					}
				});
			} catch (err) {
				onDone(err);
			}
		}
	},
	
	/**
	 * Encrypts the given key with the given scheme and passphrase.
	 * 
	 * Requires crypto-js.js and bitcoinjs.js.
	 * 
	 * @param key is an unencrypted key to encrypt
	 * @param scheme is the scheme to encrypt the key
	 * @param passphrase is the passphrase to encrypt with
	 * @param onProgress(percent) is invoked as progress as made (optional)
	 * @param onDone(err, encryptedKey) is invoked when done (optional)
	 */
	encryptKey: function(key, scheme, passphrase, onProgress, onDone) {
		
		// validate input
		try {
			if (!scheme) throw new Error("Scheme must be initialized");
			if (!isObject(key, CryptoKey)) throw new Error("Given key must be of class 'CryptoKey' but was " + cryptoKey);
			if (!passphrase) throw new Error("Passphrase must be initialized");
		} catch (err) {
			if (onDone) onDone(err);
		}
		
		// handle encryption scheme
		switch (scheme) {
			case AppUtils.EncryptionScheme.CRYPTOJS:
				try {
					var b64 = CryptoJS.AES.encrypt(key.getHex(), passphrase).toString();
					key.setState(Object.assign(key.getPlugin().newKey(b64).getState(), {address: key.getAddress()}));
					if (onProgress) onProgress(1);
					if (onDone) onDone(null, key);
				} catch (err) {
					if (onDone) onDone(err);
				}
				break;
			case AppUtils.EncryptionScheme.BIP38:
				try {
					var decoded = bitcoinjs.decode(key.getWif());
					bitcoinjs.encrypt(decoded.privateKey, true, passphrase, function(progress) {
						if (onProgress) onProgress(progress.percent / 100);
					}, null, function(err, encryptedWif) {
						try {
							if (err) throw err;
							key.setState(Object.assign(key.getPlugin().newKey(encryptedWif).getState(), {address: key.getAddress()}));
							if (onDone) onDone(null, key);
						} catch (err) {
							if (onDone) onDone(err);
						}
					});
				} catch (err) {
					if (onDone) onDone(err);
				}
				break;
			default:
				if (onDone) onDone(new Error("Encryption scheme '" + scheme + "' not supported"));
		}
	},
	
	/**
	 * Encrypts the given keys with the given encryption schemes.
	 * 
	 * @param keys are the keys to encrypt
	 * @param encryptionSchemes are the schemes to encrypt the keys
	 * @param passphrase is the passphrase to encrypt the keys with
	 * @param verifyEncryption specifies if encryption should be verified by decrypting
	 * @param onProgress(percent, label) is invoked as progress is made (optional)
	 * @param onDone(err, encryptedKeys) is invoked when encryption is done (optional)
	 */
	encryptKeys: function(keys, encryptionSchemes, passphrase, verifyEncryption, onProgress, onDone) {
		
		// verify input
		try {
			assertEquals(keys.length, encryptionSchemes.length);
			assertInitialized(passphrase);
		} catch (err) {
			if (onDone) onDone(err);
		}
		
		// collect originals if verifying encryption
		var originals;
		if (verifyEncryption) {
			originals = [];
			for (var i = 0; i < keys.length; i++) {
				originals.push(keys[i].copy());
			}
		}
		
		// track weights for progress
		var doneWeight = 0;
		var verifyWeight = 0;
		var totalWeight = 0;
		
		// collect encryption functions and weights
		var funcs = [];
		for (var i = 0; i < keys.length; i++) {
			totalWeight += AppUtils.getWeightEncryptKey(encryptionSchemes[i]);
			if (verifyEncryption) verifyWeight += AppUtils.getWeightDecryptKey(encryptionSchemes[i]);
			funcs.push(encryptFunc(keys[i], encryptionSchemes[i], passphrase));
		}
		totalWeight += verifyWeight;
		
		// encrypt async
		if (onProgress) onProgress(0, "Encrypting");
		async.parallelLimit(funcs, AppUtils.ENCRYPTION_THREADS, function(err, encryptedKeys) {
			
			// check for error
			if (err) {
				if (onDone) onDone(err);
				return;
			}
			
			// verify encryption
			if (verifyEncryption) {
				
				// copy encrypted keys
				var encryptedCopies = [];
				for (var i = 0; i < encryptedKeys.length; i++) {
					encryptedCopies.push(encryptedKeys[i].copy());
				}
				
				// decrypt keys
				if (onProgress) onProgress(doneWeight / totalWeight, "Verifying encryption");
				AppUtils.decryptKeys(encryptedCopies, passphrase, null, function(percent) {
					if (onProgress) onProgress((doneWeight + percent * verifyWeight) / totalWeight, "Verifying encryption");
				}, function(err, decryptedKeys) {
					try {
						
						// check for error
						if (err) throw err;
						
						// assert originals match decrypted keys
						doneWeight += verifyWeight;
						assertEquals(originals.length, decryptedKeys.length);
						for (var j = 0; j < originals.length; j++) {
							assertTrue(originals[j].equals(decryptedKeys[j]));
						}
						
						// done
						if (onDone) onDone(null, encryptedKeys);
					} catch (err) {
						if (onDone) onDone(err);
					}
				})
			}
			
			// don't verify encryption
			else {
				if (onDone) onDone(err, encryptedKeys);
			}
		});
		
		function encryptFunc(key, scheme, passphrase) {
			return function(onDone) {
				key.encrypt(scheme, passphrase, function(percent) {
					if (onProgress) onProgress((doneWeight +  AppUtils.getWeightEncryptKey(scheme) * percent) / totalWeight, "Encrypting");
				}, function(err, key) {
					if (err) onDone(err);
					else {
						doneWeight += AppUtils.getWeightEncryptKey(scheme);
						if (onProgress) onProgress(doneWeight / totalWeight, "Encrypting");
						setImmediate(function() { onDone(null, key); });	// let UI breath
					}
				});
			}
		}
	},
	
	/**
	 * Decrypts the given key with the given passphrase.
	 * 
	 * Requires bitcoin.js and crypto-js.js.
	 * 
	 * @param key is the key to decrypt
	 * @param passphrase is the passphrase to decrypt the key
	 * @param onProgress(percent) is invoked as progress is made (optional)
	 * @param onDone(err, decryptedKey) is invoked when done (optional)
	 */
	decryptKey: function(key, passphrase, onProgress, onDone) {
		
		// validate input
		try {
			if (!isObject(key, CryptoKey)) throw new Error("Given key must be of class 'CryptoKey' but was " + cryptoKey);
			if (!passphrase) throw new Error("Passphrase must be initialized");
			assertTrue(key.isEncrypted());
		} catch (err) {
			if (onDone) onDone(err);
		}
		
		// handle encryption scheme
		switch (key.getEncryptionScheme()) {
			case AppUtils.EncryptionScheme.CRYPTOJS:
				try {
					var hex;
					try {
						hex = CryptoJS.AES.decrypt(key.getWif(), passphrase).toString(CryptoJS.enc.Utf8);
					} catch (err) { }
					if (!hex) throw new Error("Incorrect passphrase");
					try {
						key.setPrivateKey(hex);
						if (onProgress) onProgress(1)
						if (onDone) onDone(null, key);
					} catch (err) {
						throw new Error("Incorrect passphrase");
					}
				} catch (err) {
					if (onDone) onDone(err);
				}
				break;
			case AppUtils.EncryptionScheme.BIP38:
				bitcoinjs.decrypt(key.getWif(), passphrase, function(progress) {
					if (onProgress) onProgress(progress.percent / 100);
				}, null, function(err, decrypted) {
					try {
						if (err) throw new Error("Incorrect passphrase");
						var privateKey = bitcoinjs.encode(0x80, decrypted.privateKey, true);
						key.setPrivateKey(privateKey);
						if (onDone) onDone(null, key);
					} catch (err) {
						if (onDone) onDone(err);
					}
				});
				break;
			default:
				if (onDone) onDone(new Error("Encryption scheme '" + key.getEncryptionScheme() + "' not supported"));
		}
	},
	
	/**
	 * Decrypts the given keys.
	 * 
	 * @param keys are the encrypted keys to decrypt
	 * @param phassphrase is the phassphrase to decrypt the keys
	 * @param canceller.isCancelled specifies if decryption should be cancelled
	 * @param onProgress(done, total) is called as progress is made
	 * @param onDone(err, decryptedKeys) is called when decryption is complete
	 */
	decryptKeys: function(keys, passphrase, canceller, onProgress, onDone) {
		
		// validate input
		try {
			assertInitialized(keys);
			assertTrue(keys.length > 0);
			assertInitialized(passphrase);
			assertInitialized(onDone);
		} catch (err) {
			if (onDone) onDone(err);
		}
		
		// compute weight
		var totalWeight = 0;
		for (var i = 0; i < keys.length; i++) {
			totalWeight += AppUtils.getWeightDecryptKey(keys[i].getEncryptionScheme());
		}
		
		// decrypt keys
		var funcs = [];
		for (var i = 0; i < keys.length; i++) funcs.push(decryptFunc(keys[i], passphrase));
		var doneWeight = 0;
		if (onProgress) onProgress(0, "Decrypting");
		async.parallelLimit(funcs, AppUtils.ENCRYPTION_THREADS, function(err, result) {
			if (canceller && canceller.isCancelled) return;
			else if (err) onDone(err);
			else onDone(null, keys);
		});
		
		// decrypts one key
		function decryptFunc(key, passphrase) {
			return function(onDone) {
				if (canceller && canceller.isCancelled) return;
				var scheme = key.getEncryptionScheme();
				key.decrypt(passphrase, function(percent) {
					if (onProgress) onProgress((doneWeight + AppUtils.getWeightDecryptKey(scheme) * percent) / totalWeight, "Decrypting");
				}, function(err, key) {
					if (canceller && canceller.isCancelled) return;
					if (err) onDone(err);
					else {
						doneWeight += AppUtils.getWeightDecryptKey(scheme);
						if (onProgress) onProgress(doneWeight / totalWeight);
						setImmediate(function() { onDone(err, key); });	// let UI breath
					}
				});
			}
		}
	},
	
	// Relative weights of key generation derived from experimentation and used for representative progress bars
	
	/**
	 * Computes the total weight for the given key generation configuration.
	 * 
	 * @param keyGenConfig is the key generation configuration to get the weight of
	 * @return the weight of the given key genereation configuration
	 */
	getWeightGenerateKeys: function(keyGenConfig) {
		var weight = 0;
		var numKeys = 0;
		for (var i = 0; i < keyGenConfig.currencies.length; i++) {
			var currency = keyGenConfig.currencies[i];
			numKeys += currency.numKeys;
			weight += currency.numKeys * AppUtils.getWeightCreateKey();
			if (currency.encryption) weight += currency.numKeys * (AppUtils.getWeightEncryptKey(currency.encryption) + (keyGenConfig.verifyEncryption ? AppUtils.getWeightDecryptKey(currency.encryption) : 0));
		}
		return weight + PieceRenderer.getWeight(numKeys, keyGenConfig.numPieces, null);
	},
	
	/**
	 * Returns the weight to encrypt a key with the given scheme.
	 * 
	 * @param scheme is the scheme to encrypt a key with
	 * @returns weight is the weight to encrypt a key with the given scheme
	 */
	getWeightEncryptKey: function(scheme) {
		switch (scheme) {
			case AppUtils.EncryptionScheme.BIP38:
				return 4187;
			case AppUtils.EncryptionScheme.CRYPTOJS:
				return 10;
			default: throw new Error("Unrecognized encryption scheme: " + scheme);
		}
	},
	
	/**
	 * Returns the weight to decrypt the given keys.
	 * 
	 * @param encryptedKeys are encrypted keys to determine the weight of to decrypt
	 * @returns the weight to decrypt the given keys
	 */
	getWeightDecryptKeys: function(encryptedKeys) {
		var weight = 0;
		for (var i = 0; i < encryptedKeys.length; i++) {
			var key = encryptedKeys[i];
			assertTrue(key.isEncrypted());
			weight += AppUtils.getWeightDecryptKey(key.getEncryptionScheme());
		}
		return weight;
	},

	/**
	 * Returns the weight to decrypt a key with the given scheme.
	 * 
	 * @param scheme is the scheme to decrypt a key with
	 * @returns weight is the weigh tto decrypt a key with the given scheme
	 */
	getWeightDecryptKey: function(scheme) {
		switch (scheme) {
			case AppUtils.EncryptionScheme.BIP38:
				return 4581;
			case AppUtils.EncryptionScheme.CRYPTOJS:
				return 100;
			default: throw new Error("Unrecognized encryption scheme: " + scheme);
		}
	},
	
	getWeightCreateKey: function() { return 63; },
	
	/**
	 * Gets a formatted timestamp.
	 */
	getTimestamp: function() {
		var date = new Date();
		var year = date.getFullYear();
		var month = date.getMonth() + 1;
		if (month < 10) month = "0" + month;
		var day = date.getDate();
		if (day < 10) day = "0" + day;
		var hour = date.getHours();
		if (hour < 10) hour = "0" + hour;
		var min = date.getMinutes();
		if (min < 10) min = "0" + min;
//		var sec = date.getSeconds();
//		if (sec < 10) sec = "0" + sec;
		return "" + year + month + day + hour + min;
	},
	
	/**
	 * Returns browser info.
	 * 
	 * Requires lib/ua-parser.js to be loaded.
	 * 
	 * @returns
	 * 	{
	 * 		name: "...",
	 * 		version: "...",
	 * 		major: e.g. 57
	 * 	 	windowCryptoExists: true|false,
	 * 		isOpenSource: true|false,
	 * 	  isSupported: true|false
	 * 	}
	 */
	getBrowserInfo: function() {
		
		// parse browser user agent
		var parser = new UAParser();
		var result = parser.getResult();
		
		// build info and return
		var info = {};
		info.name = result.browser.name;
		if (info.name === "Chrome" && !isChrome()) info.name = "Chromium";	// check for chromium
		info.version = result.browser.version;
		info.major = Number(result.browser.major);
		info.isOpenSource = isOpenSourceBrowser(info.name);
		info.windowCryptoExists = window.crypto ? true : false;
		info.isSupported = isSupportedBrowser(info);
		return info;
		
		// determines if chrome by checking for in-built PDF viewer
		function isChrome() {
			for (var i = 0; i < navigator.plugins.length; i++) {
				if (navigator.plugins[i].name === "Chrome PDF Viewer") return true;
			}
			return false;
		}
		
		// determines if browser is open-source
		function isOpenSourceBrowser(browserName) {
			if (arrayContains(AppUtils.OPEN_SOURCE_BROWSERS, browserName)) return true;
			if (arrayContains(AppUtils.CLOSED_SOURCE_BROWSERS, browserName)) return false;
			return null;
		}
		
		// determines if the browser is supported
		function isSupportedBrowser(browserInfo) {
			if (!browserInfo.windowCryptoExists) return false;
			if (browserInfo.name === "IE" && browserInfo.major < 11) return false;
			return true;
		}
	},
	
	/**
	 * Returns operating system info.
	 * 
	 * Requires lib/ua-parser.js to be loaded.
	 * 
	 * @returns
	 * 	{
	 * 		name: "...",
	 * 		version: "...",
	 * 		isOpenSource: true|false
	 * 	}
	 */
	getOsInfo: function() {
		
		// parse browser user agent
		var parser = new UAParser();
		var result = parser.getResult();
		
		// build and return response
		var info = {};
		info.name = result.os.name;
		info.version = result.os.version;
		info.isOpenSource = isOpenSourceOs(info);
		return info;
		
		function isOpenSourceOs(osInfo) {
			if (arrayContains(AppUtils.OPEN_SOURCE_OPERATING_SYSTEMS, osInfo.name)) return true;
			if (arrayContains(AppUtils.CLOSED_SOURCE_OPERATING_SYSTEMS, osInfo.name)) return false;
			return null;
		}
	},

	/**
	 * Determines if this app is running locally or from a remote domain.
	 * 
	 * @returns true if running local, false otherwise
	 */
	isLocal: function() {
		return window.location.href.indexOf("file://") > -1;
	},
	
	/**
	 * Determines if this app has an internet connection.
	 * 
	 * @param isOnline(true|false) is invoked when connectivity is determined
	 * @returns true if this app is online, false otherwise
	 */
	isOnline: function(isOnline) {
		isImageAccessible(AppUtils.ONLINE_IMAGE_URL, AppUtils.ONLINE_DETECTION_TIMEOUT, isOnline);
	},
	
	/**
	 * Gets all environment info that can be determined synchronously.
	 * 
	 * Requires lib/ua-parser.js to be loaded.
	 * 
	 * @returns info that can be acquired synchronously
	 */
	getEnvironmentSync: function() {		
		var info = {};
		info.browser = AppUtils.getBrowserInfo();
		info.os = AppUtils.getOsInfo();
		info.isLocal = AppUtils.isLocal();
		info.runtimeError = AppUtils.RUNTIME_ERROR;
		info.dependencyError = AppUtils.DEPENDENCY_ERROR;
		if (AppUtils.MOCK_ENVIRONMENT_ENABLED) info = Object.assign(info, AppUtils.MOCK_ENVIRONMENT);	// merge mock environment
		info.checks = AppUtils.getEnvironmentChecks(info);
		return info;
	},
	
	/**
	 * Gets all environment info.
	 * 
	 * Requires lib/ua-parser.js to be loaded.
	 * 
	 * @param onDone(info) is asynchronously invoked when all info is retrieved
	 */
	getEnvironment: function(onDone) {
		AppUtils.isOnline(function(online) {
			var info = AppUtils.getEnvironmentSync();
			info.isOnline = online;
			if (AppUtils.MOCK_ENVIRONMENT_ENABLED) info = Object.assign(info, AppUtils.MOCK_ENVIRONMENT);	// merge mock environment
			info.checks = AppUtils.getEnvironmentChecks(info);
			if (onDone) onDone(info);
		});
	},
	
	/**
	 * Enumerates environment check codes.
	 */
	EnvironmentCode: {
		BROWSER: "BROWSER",
		OPERATING_SYSTEM: "OPERATING_SYSTEM",
		INTERNET: "INTERNET",
		IS_LOCAL: "IS_LOCAL",
		RUNTIME_ERROR: "RUNTIME_ERROR",
		OPEN_SOURCE: "OPEN_SOURCE",
	},
	
	/**
	 * Interprets the given environment info and returns pass/fail/warn checks.
	 * 
	 * @param info is output from getEnvironmentInfo()
	 * @returns [{state: "pass|fail|warn", code: "..."}, ...]
	 */
	getEnvironmentChecks: function(info) {
		var checks = [];
		
		// check if browser supported
		if (info.browser && !info.browser.isSupported) checks.push({state: "fail", code: AppUtils.EnvironmentCode.BROWSER});
		
		// check if runtime error
		if (info.runtimeError) checks.push({state: "fail", code: AppUtils.EnvironmentCode.RUNTIME_ERROR});
		
		// check if dependency error
		if (info.dependencyError) checks.push({state: "fail", code: AppUtils.EnvironmentCode.INTERNET});
		
		// check if remote and not online
		var internetRequiredError = false;
		if (isInitialized(info.isOnline)) {
			if (!info.isLocal && !info.isOnline && AppUtils.NO_INTERNET_CAN_BE_ERROR) {
				internetRequiredError = true;
				checks.push({state: "fail", code: AppUtils.EnvironmentCode.INTERNET});
			}
		}
		
		// check if online
		if (!internetRequiredError && !info.dependencyError && isInitialized(info.isOnline)) {
			if (!info.isOnline) checks.push({state: "pass", code: AppUtils.EnvironmentCode.INTERNET});
			else checks.push({state: "warn", code: AppUtils.EnvironmentCode.INTERNET});
		}
		
		// check if local
		if (isInitialized(info.isLocal)) {
			if (info.isLocal) checks.push({state: "pass", code: AppUtils.EnvironmentCode.IS_LOCAL});
			else checks.push({state: "warn", code: AppUtils.EnvironmentCode.IS_LOCAL});
		}
		
		// check open-source browser
		if (info.browser && info.browser.isSupported) {
			if (info.browser.isOpenSource) checks.push({state: "pass", code: AppUtils.EnvironmentCode.BROWSER});
			else checks.push({state: "warn", code: AppUtils.EnvironmentCode.BROWSER});
		}
		
		// check open-source os
		if (isInitialized(info.os)) {
			if (info.os.isOpenSource) checks.push({state: "pass", code: AppUtils.EnvironmentCode.OPERATING_SYSTEM});
			else checks.push({state: "warn", code: AppUtils.EnvironmentCode.OPERATING_SYSTEM});
		}
		
		return checks;
	},
	
	/**
	 * Sets the cached environment info.
	 * 
	 * @param environment is the cached environment info to set
	 */
	setCachedEnvironment: function(environment) {
		AppUtils.environment = environment;
	},
	
	/**
	 * Returns the cached environment info.
	 */
	getCachedEnvironment: function() {
		return AppUtils.environment;
	},
	
	/**
	 * Polls environment info and notifies listeners on loop.
	 * 
	 * Requires lib/ua-parser.js to be loaded.
	 * 
	 * @param initialEnvironmentInfo is initial environment info to notify listeners
	 */
	pollEnvironment: function(initialEnvironmentInfo) {
		
		// notify listeners of initial environment info
		if (initialEnvironmentInfo) setEnvironmentInfo(initialEnvironmentInfo);
		
		// refresh environment info on loop
		refreshEnvironmentInfo();
		function refreshEnvironmentInfo() {
			AppUtils.getEnvironment(function(info) {
				setEnvironmentInfo(info);
			});
			setTimeout(refreshEnvironmentInfo, AppUtils.ENVIRONMENT_REFRESH_RATE);
		}
		
		function setEnvironmentInfo(info) {
			AppUtils.environment = info;
			AppUtils.notifyEnvironmentListeners(info);
		}
	},
	
	/**
	 * Registers an environment listener to be notified when environment info is updated.
	 * 
	 * Synchronously calls the listener with the last known environment info.
	 * 
	 * @param listener(info) will be invoked as environment info is updated
	 */
	addEnvironmentListener: function(listener) {
		assertInitialized(listener);
		if (!AppUtils.environmentListeners) AppUtils.environmentListeners = [];
		AppUtils.environmentListeners.push(listener);
		if (AppUtils.environment) listener(AppUtils.environment);
	},
	
	/**
	 * Notifies all registered environment listeners of updated environment info.
	 * 
	 * @param info is the environment info to notify listeners of
	 */
	notifyEnvironmentListeners: function(info) {
		if (!AppUtils.environmentListeners) return;
		for (var i = 0; i < AppUtils.environmentListeners.length; i++) {
			var listener = AppUtils.environmentListeners[i];
			if (listener) listener(info);
		}
	},
	
	/**
	 * Determines if the given environment info has the given state.
	 * 
	 * @param info is environment info with state
	 * @param state is the state to check the environment info for
	 * @returns true if the environment info has the given state, false otherwise
	 */
	hasEnvironmentState: function(state) {
		for (var i = 0; i < AppUtils.environment.checks.length; i++) {
			if (AppUtils.environment.checks[i].state === state) return true;
		}
		return false;
	},
	
	/**
	 * Set an unexpected runtime error and notifies all listeners of the updated environment.
	 */
	setRuntimeError: function(err) {
		if (!AppUtils.environment) AppUtils.environment = {};
		AppUtils.RUNTIME_ERROR = err;
		AppUtils.environment.runtimeError = err;
		AppUtils.environment.checks = AppUtils.getEnvironmentChecks(AppUtils.environment);
		AppUtils.notifyEnvironmentListeners(AppUtils.environment);
	},
	
	/**
	 * Sets an error if cannot fetch dependencies.
	 * 
	 * @param bool specifies if the dependency error is enabled or disabled
	 */
	setDependencyError: function(bool) {
		if (!AppUtils.environment) AppUtils.environment = {};
		AppUtils.DEPENDENCY_ERROR = bool;
		AppUtils.environment.dependencyError = bool;
		AppUtils.environment.checks = AppUtils.getEnvironmentChecks(AppUtils.environment);
		AppUtils.notifyEnvironmentListeners(AppUtils.environment);
	},
	
		/**
	 * Sets if lack of internet can be a critical error if the site is running remotely.
	 * 
	 * After dependencies are done loading in the export page, internet is no longer required
	 * even if the site is running remotely, so this method stops treating internet disconnection
	 * as critical.
	 * 
	 * @param bool specifies if no internet can be a critical error
	 */
	setNoInternetCanBeError: function(bool) {
		AppUtils.NO_INTERNET_CAN_BE_ERROR = bool;
	},
	
	/**
	 * Runs minimum tests to verify key generation, encryption, and splitting.
	 * 
	 * @param onDone(err) is invoked when done
	 */
	runMinimumTests: function(onDone) {
		
		// build key generation configuration
		var config = {};
		config.passphraseEnabled = true;
		config.passphrase = Tests.PASSPHRASE;
		config.splitEnabled = true;
		config.numPieces = 3;
		config.minPieces = 2;
		config.verifyEncryption = true;
		config.currencies = [];
		var plugins = AppUtils.getCryptoPlugins();
		config.currencies.push({
			ticker: AppUtils.getCryptoPlugin("BTC").getTicker(),
			numKeys: 1,
			encryption: AppUtils.EncryptionScheme.CRYPTOJS
		});
		config.currencies.push({
			ticker: AppUtils.getCryptoPlugin("XMR").getTicker(),
			numKeys: 1,
			encryption: AppUtils.EncryptionScheme.CRYPTOJS
		});
		config.currencies.push({
			ticker: AppUtils.getCryptoPlugin("ETH").getTicker(),
			numKeys: 1,
			encryption: AppUtils.EncryptionScheme.CRYPTOJS
		});
		
		// generate keys and test
		AppUtils.generateKeys(config, null, function(err, keys, pieces, pieceDivs) {
			if (err) onDone(err);
			else {
				try {
					assertEquals(3, keys.length);
					assertEquals(3, pieces.length);
					assertEquals(3, pieceDivs.length);
					onDone(null);
				} catch (err) {
					onDone(err);
				}
			}
		});
	}
}
