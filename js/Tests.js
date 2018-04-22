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
 * Tests the cryptostorage application.
 */
var Tests = {
	
	// constants
	REPEAT_LONG: 20,
	REPEAT_SHORT: 2,
	NUM_PIECES: 3,
	MIN_PIECES: 2,
	PASSPHRASE: "MySuperSecretPassphraseAbcTesting123",
	TEST_PLUGINS: true,
	
	/**
	 * Returns crypto plugins to test.
	 */
	getTestCryptoPlugins: function() {
		var plugins = [];
		plugins.push(new BitcoinPlugin());
		plugins.push(new BitcoinCashPlugin());
		plugins.push(new EthereumPlugin());
		plugins.push(new MoneroPlugin());
		plugins.push(new DashPlugin());
		plugins.push(new LitecoinPlugin());
		plugins.push(new ZcashPlugin());
		plugins.push(new RipplePlugin());
		plugins.push(new StellarPlugin());
		plugins.push(new WavesPlugin());
		plugins.push(new NeoPlugin());
		plugins.push(new BIP39Plugin());
		return plugins;
	},
	
	/**
	 * Runs all tests.
	 * 
	 * Invokes callback() when done with an error argument if an error occurs.
	 */
	runTests: function(callback) {
		
		// window.crypto required for tests
		if (!window.crypto) throw new Error("Cannot run tests without window.crypto");
		
		// get test plugins
		var plugins = Tests.getTestCryptoPlugins();
		
		// load dependencies
		LOADER.load(AppUtils.getAppDependencies(), function() {
			
			// test utilities
			testUtils();
			
			// test file import
			testFileImport(plugins, function() {
				
				// test key parsing
				testParseKey(plugins);
				
				// test piece conversion
				testPieceConversion(plugins, function() {
					
					// test split and combine
					for (var i = 0; i < plugins.length; i++) testSplitAndCombine(plugins[i]);
					
					// test invalid pieces
					if (plugins.length > 1) testInvalidPiecesToKeys(plugins);
					
					// test key generation
					testGenerateKeys(plugins, function(err) {
						if (err) {
							if (callback) callback(err);f
							return;
						}
						
						// test individual plugins
						if (Tests.TEST_PLUGINS) {
							testCryptoPlugins(plugins, function(error) {
								if (callback) callback(error);
							});
						} else {
							if (callback) callback();
						}
					});
				});
			});
		});
		
		function testUtils() {
			
			// test isHex()
			assertFalse(isHex(false));
			assertFalse(isHex(true));
			assertFalse(isHex("hello there"));
			assertTrue(isHex("fcc256cbc5a180831956fba7b9b7de5f521037c39980921ebe6dbd822f791007"));
			assertTrue(isString("abctesting123"));
			assertFalse(isString(null));
			assertFalse(isString(undefined));
			assertFalse(isString(123));
			assertTrue(isBase58("abcd"))
			assertFalse(isBase58("abcd0"))
			
			// test valid versions
			var validVersions = [[0, 0, 1], [12, 23, 4], [16, 1, 5]];
			for (var i = 0; i < validVersions.length; i++) {
				var versionNumbers = AppUtils.getVersionNumbers(validVersions[i][0] + "." + validVersions[i][1] + "." + validVersions[i][2]);
				for (var j = 0; j < validVersions[0].length; j++) {
					assertEquals(validVersions[i][j], versionNumbers[j], "Unexpected version number at [" + i + "][" + j + "]: " + validVersions[i][j] + " vs " + versionNumbers[j]);
				}
			}
			
			// test invalid versions
			var invalidVersions = ["3.0.1.0", "3.0.-1", "3.0", "4", "asdf", "4.f.2", "0.0.0"];
			for (var i = 0; i < invalidVersions.length; i++) {
				try {
					AppUtils.getVersionNumbers(invalidVersions[i]);
					throw new Error("fail");
				} catch (err) {
					if (err.message === "fail") throw new Error("Should have thrown exception on version string: " + invalidVersions[i]);
				}
			}
			
			// test isBase58()
			for (var i = 0; i < Tests.getTestCryptoPlugins().length; i++) {
				var plugin = Tests.getTestCryptoPlugins()[i];
				var key = plugin.newKey()
				var pieces = plugin.split(key, 3, 2);
				for (var j = 0; j < pieces.length; j++) {
					assertTrue(isBase58(pieces[j]));
				}
			}
		}
		
		function testParseKey(plugins) {
			for (var i = 0; i < plugins.length; i++) {
				var plugin = plugins[i];
				
				// parse unencrypted key
				var wif = plugin.newKey().getWif();
				var key = AppUtils.parseKey(plugin, wif);
				assertEquals(key.getWif(), wif);
				
				// parse empty key
				try {
					AppUtils.parseKey(plugin, "");
					fail("fail");
				} catch (err) {
					if (err.message === "fail") throw new Error("Should not have parsed key from empty string");
				}
				
				// parse whitespace key
				key = AppUtils.parseKey(plugin, " ");
				assertNull(key, "Should not have parsed key from whitespace string");
			}
		}
		
		function testGenerateKeys(plugins, onDone) {
			
			// test each plugin
			var testFuncs = [];
			for (var i = 0; i < plugins.length; i++) testFuncs.push(testGenerateKeysFunc(plugins[i]));
			async.series(testFuncs, onDone);
			function testGenerateKeysFunc(plugin) {
				return function(onDone) {
					return testGenerateKeysPlugin(plugin, onDone);
				}
			}
			
			// test one plugin
			function testGenerateKeysPlugin(plugin, onDone) {
				console.log("testGenerateKeys(" + plugin.getTicker() + ")");
				
				// get generation config
				var config = getKeyGenConfig(plugin);
				
				// generate keys
				var progressReported = true;
				AppUtils.generateKeys(config, function(percent, label) {
					assertTrue(percent >= 0 && percent <= 1);
					lastProgress = percent;
				}, function(err, keys, pieces, pieceDivs) {
					
					// check for error
					if (err) {
						onDone(err);
						return;
					}
					
					// test that progress was reported
					assertEquals(lastProgress, 1);
					
					// test piece structure
					assertEquals(config.numPieces, pieces.length);
					assertEquals(config.numPieces, pieceDivs.length);
					for (var i = 0; i < pieces.length; i++) {
						assertEquals(AppUtils.VERSION, pieces[i].version);
						assertEquals(i + 1, pieces[i].pieceNum);
						assertInitialized(pieces[i].keys);
						assertTrue(pieces[i].keys.length > 1);
					}
					
					// test key structure
					var keyIdx = 0;
					for (var i = 0; i < config.currencies.length; i++) {
						for (var j = 0; j < config.currencies[i].numKeys; j++) {
							var key = keys[keyIdx++];
							assertTrue(plugin.isAddress(key.getAddress()));
							assertEquals(config.currencies[i].encryption, key.getEncryptionScheme());
						}
					}
					assertEquals(keyIdx, keys.length);
					
					// test piece combinations recreate keys
					var combinations = getCombinations(pieces, Tests.MIN_PIECES);
					for (var j = 0; j < combinations.length; j++) {
						var combination = combinations[j];
						var combinedKeys = AppUtils.piecesToKeys(combination);
						assertEquals(keys.length, combinedKeys.length);
						for (var i = 0; i < keys.length; i++) {
							assertTrue(keys[i].equals(combinedKeys[i]));
						}
					}						
					
					// no failures
					onDone();
				});
				
				// build key generation configuration
				function getKeyGenConfig(plugin) {
					var config = {};
					config.currencies = [];
					config.passphrase = Tests.PASSPHRASE;
					config.verifyEncryption = true;
					config.numPieces = Tests.NUM_PIECES;
					config.minPieces = Tests.MIN_PIECES;
					
					// config no encryption
					config.currencies.push({
						ticker: plugin.getTicker(),
						numKeys: Tests.REPEAT_SHORT,
						encryption: null
					});
					
					// config encryption
					for (var i = 0; i < plugin.getEncryptionSchemes().length; i++) {
						var scheme = plugin.getEncryptionSchemes()[i];
						config.currencies.push({
							ticker: plugin.getTicker(),
							numKeys: Tests.REPEAT_SHORT,
							encryption: scheme
						})
					}
					
					return config;
				}
			}
		}

		function testCryptoPlugins(plugins, onDone) {
			var funcs = [];
			for (var i = 0; i < plugins.length; i++) funcs.push(testPluginFunc(plugins[i]));
			async.series(funcs, onDone);
			
			function testPluginFunc(plugin) {
				return function(callback) {
					testCryptoPlugin(plugin, callback);
				}
			}
		}

		function testCryptoPlugin(plugin, onDone) {
			console.log("testCryptoPlugin(" + plugin.getTicker() + ")");
			
			// test plugin
			assertInitialized(plugin.getName());
			assertInitialized(plugin.getTicker());
			assertInitialized(plugin.getLogo());
			assertFalse(plugin.isAddress("invalidAddress123"));
			assertFalse(plugin.isAddress(null));
			assertFalse(plugin.isAddress(undefined));
			assertFalse(plugin.isAddress([]));
			
			// test unencrypted keys
			var keys = [];
			for (var i = 0; i < Tests.REPEAT_LONG; i++) {
				
				// create new key
				var key = plugin.newKey();
				keys.push(key);
				assertInitialized(key.getHex());
				assertInitialized(key.getWif());
				assertNull(key.getEncryptionScheme());
				var copy = key.copy();
				assertTrue(key.equals(copy));
				
				// test address
				assertInitialized(key.getAddress());
				assertTrue(plugin.isAddress(key.getAddress()));
				key.setAddress(key.getAddress());
				try {
					key.setAddress("invalidAddress123");
					fail("fail");
				} catch(err) {
					if (err.message === "fail") throw new Error("Cannot change address of unencrypted key");
				}
				
				// test new key from unencrypted hex and wif
				var key2 = new CryptoKey(plugin, key.getHex());
				assertTrue(key.equals(key2));
				key2 = new CryptoKey(plugin, key.getWif());
				assertTrue(key.equals(key2));
			}
			
			// test excluding keys
			testKeyExclusion(keys);
			
			// test piece conversion with and without splitting
			testKeysToPieces([keys[0]], 1);
			for (var i = 0; i < keys.length; i++) testKeysToPieces([keys[i]], Tests.NUM_PIECES, Tests.MIN_PIECES);
			testKeysToPieces(keys, Tests.NUM_PIECES, Tests.MIN_PIECES);
			
			// test invalid private keys
			var invalids = [" ", "ab", "abctesting123", "abc testing 123", 12345, plugin.newKey().getAddress(), "U2FsdGVkX1+41CvHWzRBzaBdh5Iz/Qu42bV4t0Q5WMeuvkiI7bzns76l6gJgquKcH2GqHjHpfh7TaYmJwYgr3QYzNtNA/vRrszD/lkqR2+uRVABUnfVziAW1JgdccHE", "U2FsdGVkX19kbqSAg6GjhHE+DEgGjx2mY4Sb7K/op0NHAxxHZM34E6eKEBviUp1U9OC6MdG fEOfc9zkAfMTCAvRwoZu36h5tpHl7TKdQvOg3BanArtii8s4UbvXxeGgy", "7ac1f31ddd1ce02ac13cf10b77b42be0aca008faa2f45f223a73d32e261e98013002b3086c88c4fcd8912cd5729d56c2eee2dcd10a8035666f848112fc58317ab7f9ada371b8fc8ac6c3fd5eaf24056ec7fdc785597f6dada9c66c67329a140a", "3b20836520fe2e8eef1fd3f898fd97b5a3bcb6702fae72e3ca1ba8fb6e1ddd75b12f74dc6422606d1750e40"];
			for (var i = 0; i < invalids.length; i++) {
				var invalid = invalids[i];
				try {
					var key = plugin.newKey(invalid);
					fail("fail");
				} catch (err) {
					if (err.message === "fail") throw new Error("Should not create key from invalid input: " + plugin.getTicker() + "(" + invalid + ")");
				}
			}
			
			// parse undefined
			try {
				plugin.newKey(undefined);
				fail("Should have thrown an error");
			} catch (error) { }
			
			// collect functions to test each encryption scheme
			assertTrue(plugin.getEncryptionSchemes().length >= 1);
			var funcs = [];
			for (var i = 0; i < plugin.getEncryptionSchemes().length; i++) {
				var scheme = plugin.getEncryptionSchemes()[i];
				var max = scheme === AppUtils.EncryptionScheme.BIP38 ? Tests.REPEAT_SHORT : Tests.REPEAT_LONG;
				if (max < 1) continue;
				var keys = [];
				for (var j = 0; j < max; j++) keys.push(plugin.newKey());
				funcs.push(testEncryptKeysFunc(keys, scheme, Tests.PASSPHRASE));
			}
			
			// callback function to test encryption
			function testEncryptKeysFunc(keys, scheme, passphrase) {
				return function(onDone) {
					testEncryptKeys(keys, scheme, passphrase, onDone);
				}
			}
			
			// execute encryption tests
			async.parallel(funcs, function(err) {
				if (err) {
					onDone(err);
					return;
				}
				
				// test wrong passphrase decryption
				testDecryptWrongPassphrase(plugin, onDone);
			});
		}
		
		function testKeyExclusion(keys) {
			
			// test exclude public
			var copies = [];
			for (var i = 0; i < keys.length; i++) copies.push(keys[i].copy());
			AppUtils.applyKeyConfig(copies, { includePublic: false});
			for (var i = 0; i < copies.length; i++) {
				var key = copies[i];
				assertUninitialized(key.getState().address);
				assertInitialized(key.getState().wif);
				assertInitialized(key.getState().hex);
				assertDefined(key.getState().encryption);
			}
			testKeysToPieces(copies, 1);
			testKeysToPieces(copies, Tests.NUM_PIECES, Tests.MIN_PIECES);

			// test exclude private
			copies = [];
			for (var i = 0; i < keys.length; i++) copies.push(keys[i].copy());
			AppUtils.applyKeyConfig(copies,  { includePrivate: false});
			for (var i = 0; i < copies.length; i++) {
				var key = copies[i];
				assertInitialized(key.getState().address);
				assertUndefined(key.getState().wif);
				assertUndefined(key.getState().hex);
				assertUndefined(key.getState().encryption);
			}
			testKeysToPieces(copies, 1, null);
			try {
				testKeysToPieces(copies, Tests.NUM_PIECES, Tests.MIN_PIECES);
				fail("fail");
			} catch (err) {
				if (err.message === "fail") throw new Error("Should not have been able to split keys without private components")
			}
		}
		
		function testEncryptKeys(keys, scheme, passphrase, onDone) {
			assertTrue(keys.length > 0);
			
			// keep originals for later validation
			var originals = copyKeys(keys);
			
			// collect schemes
			var schemes = [];
			for (var i = 0; i < keys.length; i++) schemes.push(scheme);
			
			// encrypt keys
			AppUtils.encryptKeys(keys, schemes, passphrase, false, null, function(err, encryptedKeys) {
				if (err) {
					onDone(err);
					return;
				}
				
				// test state of each key
				assertEquals(keys.length, encryptedKeys.length);
				for (var i = 0; i < keys.length; i++) {
					var key = keys[i];
					
					// test basic initialization
					assertObject(key, CryptoKey);
					assertTrue(key.isEncrypted());
					assertTrue(key.equals(encryptedKeys[i]));
					assertFalse(key.equals(originals[i]));
					assertInitialized(key.getHex());
					assertInitialized(key.getWif());
					assertEquals(scheme, key.getEncryptionScheme());
					assertTrue(key.equals(key.copy()));
					
					// test address
					assertInitialized(key.getAddress());
					key.setAddress(key.getAddress());
					try {
						key.setAddress("invalidAddress123");
					} catch (err) {
						if (err.message === "fail") throw new Error("Cannot set encrypted key's address to invalid address");
					}
					
					// test new key from encrypted hex and wif
					var key2 = new CryptoKey(key.getPlugin(), key.getHex());
					if (key2.getAddress() !== AppUtils.NA) assertUndefined(key2.getAddress());
					key2.setAddress(key.getAddress());
					assertTrue(key.equals(key2));
					key2 = new CryptoKey(key.getPlugin(), key.getWif());
					if (key2.getAddress() !== AppUtils.NA) assertUndefined(key2.getAddress());
					key2.setAddress(key.getAddress());
					assertTrue(key.equals(key2));
					
					// test consistency
					var parsed = new CryptoKey(key.getPlugin(), key.getHex());
					assertEquals(key.getHex(), parsed.getHex());
					assertEquals(key.getWif(), parsed.getWif());
					assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
					parsed = new CryptoKey(key.getPlugin(), key.getWif());
					assertEquals(key.getHex(), parsed.getHex());
					assertEquals(key.getWif(), parsed.getWif());
					assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
				}
				
				// test key exclusion
				testKeyExclusion(keys);
				
				// test piece conversion
				testKeysToPieces([keys[0]], 1);
				for (var i = 0; i < keys.length; i++) testKeysToPieces([keys[i]], Tests.NUM_PIECES, Tests.MIN_PIECES);
				testKeysToPieces(keys, Tests.NUM_PIECES, Tests.MIN_PIECES);
				
				// test decryption with wrong passphrase
				testDecryptKeys([keys[0]], "wrongPassphrase123", function(err) {
					assertEquals("Incorrect passphrase", err.message);
					
					// test decryption
					testDecryptKeys(keys, passphrase, function(err, result) {
						if (err) throw err;
						assertEquals(originals.length, keys.length);
						for (var i = 0; i < originals.length; i++) assertTrue(originals[i].equals(keys[i]));
						onDone();
					});
				});
			});
			
			function testDecryptKeys(keys, passphrase, onDone) {
				assertTrue(keys.length > 0);
				
				// save originals for later
				var originals = [];
				for (var i = 0; i < keys.length; i++) originals.push(keys[i].copy());
				
				// decrypt keys
				AppUtils.decryptKeys(keys, passphrase, null, null, function(err, decryptedKeys) {
					if (err) {
						onDone(err);
						return;
					}
					
					// test state of each key
					assertEquals(keys.length, decryptedKeys.length);
					for (var i = 0; i < keys.length; i++) {
						var key = keys[i];
						
						// test basic initialization
						assertObject(key, CryptoKey);
						assertTrue(key.equals(decryptedKeys[i]));
						assertFalse(key.equals(originals[i]));
						assertInitialized(key.getHex());
						assertInitialized(key.getWif());
						assertInitialized(key.getAddress());
						assertNull(key.getEncryptionScheme());
						assertTrue(key.equals(key.copy()));
						
						// test consistency
						var parsed = new CryptoKey(key.getPlugin(), key.getHex());
						assertEquals(key.getHex(), parsed.getHex());
						assertEquals(key.getWif(), parsed.getWif());
						assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
						parsed = new CryptoKey(key.getPlugin(), key.getWif());
						assertEquals(key.getHex(), parsed.getHex());
						assertEquals(key.getWif(), parsed.getWif());
						assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
					}
					
					// done
					onDone();
				});
			}
		}
		
		function testDecryptWrongPassphrase(plugin, onDone) {
			var privateKey = "U2FsdGVkX19kbqSAg6GjhHE+DEgGjx2mY4Sb7K/op0NHAxxHZM34E6eKEBviUp1U9OC6MdGfEOfc9zkAfMTCAvRwoZu36h5tpHl7TKdQvOg3BanArtii8s4UbvXxeGgy";
			var key = plugin.newKey(privateKey);
			key.decrypt("abctesting123", null, function(err, decryptedKey) {
				assertEquals("Incorrect passphrase", err.message);
				onDone();
			});
		}

		function testKeysToPieces(keys, numPieces, minPieces) {
			
			// validate input
			assertTrue(keys.length > 0);
			assertInitialized(numPieces);
			if (numPieces > 1) assertInitialized(minPieces);
			if (minPieces) {
				assertTrue(minPieces <= numPieces);
				assertTrue(minPieces > 1);
			}
			
			// convert keys to pieces
			var pieces = AppUtils.keysToPieces(keys, numPieces, minPieces);
			
			// test each share in each piece
			for (var i = 0; i < pieces.length; i++) {
				var piece = pieces[i];
				for (var j = 0; j < keys.length; j++) {
					assertEquals(keys[j].getPlugin().getTicker(), piece.keys[j].ticker);
					assertEquals(keys[j].getAddress(), piece.keys[j].address);
					if (numPieces > 1) {
						assertNumber(piece.pieceNum);
						assertInt(piece.pieceNum);
						assertTrue(piece.pieceNum > 0);
						assertFalse(keys[j].getWif() === piece.keys[j].wif);
						assertEquals(undefined, piece.keys[j].encryption);
					} else {
						assertUndefined(piece.pieceNum);
						assertTrue(keys[j].getWif() === piece.keys[j].wif);
						if (piece.keys[j].wif) {
							assertDefined(piece.keys[j].encryption);
							assertEquals(keys[j].getEncryptionScheme(), piece.keys[j].encryption);
						} else {
							assertEquals(undefined, piece.keys[j].encryption);
						}
					}
				}
			}
			
			// verify secrets is initialized with 7 bits
			if (numPieces > 1) {
				for (var i = 0; i < pieces[0].keys.length; i++) {
					var pieceKey = pieces[0].keys[i];
					if (pieceKey.wif && !keys[i].getEncryptionScheme() && pieceKey.ticker === 'BTC') {
						var decoded = AppUtils.decodeShare(pieceKey.wif);
						assertEquals(minPieces, decoded.minPieces);
						var b58 = Bitcoin.Base58.encode(Crypto.util.hexToBytes(decoded.hex));
						assertTrue(b58.startsWith("3X"));
					}
				}
			}
			
			// test each piece combination
			var combinations = getCombinations(pieces, minPieces ? minPieces : 1);
			for (var i = 0; i < combinations.length; i++) {
				var combination = combinations[i];
				var keysFromPieces = AppUtils.piecesToKeys(pieces);
				assertEquals(keys.length, keysFromPieces.length);
				for (var j = 0; j < keys.length; j++) {
					assertTrue(keys[j].equals(keysFromPieces[j]));
				}
			}
		}

		function testInvalidPiecesToKeys(plugins) {
			
			// collect keys for different currencies
			var keys1 = [];
			var keys2 = [];
			for (var i = 0; i < 10; i++) {
				keys1.push(plugins[0].newKey());
				keys2.push(plugins[1].newKey());
			}
			
			// convert to pieces
			var pieces1 = AppUtils.keysToPieces(keys1);
			var pieces2 = AppUtils.keysToPieces(keys2);
			
			// try to combine pieces
			try {
				AppUtils.piecesToKeys([pieces1[0], pieces2[0]]);
				fail("fail");
			} catch(err) {
				if (err.message === "fail") throw new Error("Cannot get keys from incompatible pieces");
			}
		}

		function copyKeys(keys) {
			var copies = [];
			for (var i = 0; i < keys.length; i++) copies.push(keys[i].copy());
			return copies;
		}
		
		function testSplitAndCombine(plugin) {
			for (var i = 0; i < Tests.REPEAT_LONG; i++) {
				var key = plugin.newKey();
				var pieces = plugin.split(key, Tests.NUM_PIECES, Tests.MIN_PIECES);
				
				// test that single pieces cannot create key
				for (var j = 0; j < pieces.length; j++) {
					assertTrue(pieces[j].length <= 136);
					try {
						plugin.combine([pieces[j]]);
						throw new Error("fail");
					} catch (err) {
						if (err.message === "fail") throw new Error("Cannot combine single pieces");
					}
				}
				
				// test each piece combination
				var combinations = getCombinations(pieces, Tests.MIN_PIECES);
				for (var j = 0; j < combinations.length; j++) {
					var combination = combinations[j];
					var combined = plugin.combine(combination);
					assertTrue(key.equals(combined));
				}
			}
			
			// test split with max shares
			var key = plugin.newKey();
			var pieces = plugin.split(key, AppUtils.MAX_SHARES, AppUtils.MAX_SHARES);
			var combined = plugin.combine(pieces);
			assertTrue(key.equals(combined));
		}
		
		function testFileImport(plugins, onDone) {
			console.log("testFileImport()");
			
			// initialize controller
			var controller = new ImportFileController($("<div>"));
			controller.render(function() {
				
				// collect test functions
				var funcs = [];
				funcs.push(testOnePieceValidity());
				if (plugins.length > 1) funcs.push(testIncompatiblePieces());
				funcs.push(testAdditionalPiecesNeeded());
				
				// run test functions
				async.series(funcs, function(err) {
					if (err) throw err;
					onDone();
				});
				
				function testOnePieceValidity() {
					return function(onDone) {
						var piece = {};
						var namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.version is not defined", controller.getWarning());
						controller.startOver();
						
						piece = { version: "asdf" };
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.version is invalid version string: asdf", controller.getWarning());
						controller.startOver();
						
						piece = { version: "1.0.0", pieceNum: "asdf" };
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.pieceNum is not an integer", controller.getWarning());
						controller.startOver();
						
						piece = { version: "0.2.1", pieceNum: 0 };
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.pieceNum is not greater than 0", controller.getWarning());
						controller.startOver();
						
						piece = { version: "1.2.3" };
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.keys is not defined", controller.getWarning());
						controller.startOver();
						
						piece = { version: "2.4.0", keys: "asdf"};
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.keys is not an array", controller.getWarning());
						controller.startOver();
						
						piece = { version: "0.0.1", keys: []};
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.keys is empty", controller.getWarning());
						controller.startOver();
						
						piece = { version: "2.3.1", keys: [{}]};
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.keys[0].ticker is not defined", controller.getWarning());
						controller.startOver();
						
						piece = { version: "4.6.4", keys: [{
							ticker: "BTC",
							address: "1Gdkr2UhDACVCzz1Xm3mB3j3RFiTBLAT8a",
							wif: "Ky65sCEcvmVWjngwGnRBQEwtZ9kHnZEjsjRkjoa1xAMaDKQrzE2q",
						}]};
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("", controller.getWarning());
						controller.startOver();
						
						piece = { version: "4.6.4", keys: [{
							ticker: "BTC",
							address: "1Gdkr2UhDACVCzz1Xm3mB3j3RFiTBLAT8a",
							wif: "Ky65sCEcvmVWjngwGnRBQEwtZ9kHnZEjsjRkjoa1xAMaDKQrzE2q",
							encryption: "invalidScheme"
						}]};
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.keys[0].encryption is unrecognized: invalidScheme", controller.getWarning());
						controller.startOver();
						
						piece = { version: "0.0.1", pieceNum: 1, keys: [{
							ticker: "BTC",
							address: "1PshW4gesSamVeZ5uP2C8AipMgsYeQu34X",
							wif: "2c3XyNwGVqDqke6tgWd6RcZTHBW77X1SLrUnR2jGLai9e2hpC",
							encryption: null
						}, {
							ticker: "BTC",
							address: "18Tqw3Mb1MNx7xmh8st7s9zvbEH1NagWWi",
							wif: "3c3XyEvJZiYJRdzCbDrHLU7pyEKBQdJRC6Mk1fb4A1mR79CbV",
							encryption: null
						}]};
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("Invalid piece 'piece.json': piece.keys[1].wif has a different minimum threshold prefix", controller.getWarning());
						controller.startOver();
						
						// valid piece
						piece = { version: "1.0.0", keys: [{
							ticker: "BTC",
							address: "1Gdkr2UhDACVCzz1Xm3mB3j3RFiTBLAT8a",
							wif: "Ky65sCEcvmVWjngwGnRBQEwtZ9kHnZEjsjRkjoa1xAMaDKQrzE2q",
							encryption: null
						}]};
						namedPieces = [];
						namedPieces.push({name: 'piece.json', piece: piece});
						controller.addNamedPieces(namedPieces);
						assertEquals("", controller.getWarning());
						controller.startOver();
						
						onDone();
					}
				}
				
				function testIncompatiblePieces() {
					return function(onDone) {

						// this test assume more than one plugin
						assertTrue(plugins.length > 1);

						var pieces1 = getPieces(plugins, 1, 3, 2);
						var pieces2 = getPieces(plugins, 2, 3, 2);
						var namedPieces = [];
						namedPieces.push({name: "piece1.json", piece: pieces1[0]});
						namedPieces.push({name: "piece2.json", piece: pieces2[0]});
						controller.addNamedPieces(namedPieces);
						assertEquals("Pieces contain different number of keys", controller.getWarning());
						controller.startOver();
						
						pieces2 = getPieces(plugins, 1, 3, 2);
						namedPieces = [];
						namedPieces.push({name: "piece1.json", piece: pieces1[0]});
						namedPieces.push({name: "piece2.json", piece: pieces2[0]});
						controller.addNamedPieces(namedPieces);
						assertEquals("Pieces have different addresses", controller.getWarning());
						controller.startOver();
						
						var oldValue = pieces1[1].keys[1].ticker;
						pieces1[1].keys[1].ticker = "ABC";
						namedPieces = [];
						namedPieces.push({name: "piece1.json", piece: pieces1[0]});
						namedPieces.push({name: "piece2.json", piece: pieces1[1]});
						controller.addNamedPieces(namedPieces);
						assertEquals("Pieces are for different cryptocurrencies", controller.getWarning());
						pieces1[1].keys[1].ticker = oldValue;
						controller.startOver();
						
						oldValue = pieces1[1].keys[1].wif;
						for (var i = 0; i < pieces1[1].keys.length; i++) {
							pieces1[1].keys[i].wif = oldValue.replaceAt(0, "3");
						}
						namedPieces = [];
						namedPieces.push({name: "piece1.json", piece: pieces1[0]});
						namedPieces.push({name: "piece2.json", piece: pieces1[1]});
						controller.addNamedPieces(namedPieces);
						assertEquals("Pieces have different minimum thresholds", controller.getWarning());
						pieces1[1].keys[1].wif = oldValue;
						controller.startOver();

						onDone();
					}
				}
				
				function testAdditionalPiecesNeeded() {
					return function(onDone) {
						
						// get pieces
						var pieces = getPieces(plugins, 1, 4, 3);
						
						var namedPieces = [];
						namedPieces.push({name: "piece0.json", piece: pieces[0]});
						controller.addNamedPieces(namedPieces);
						assertEquals("Need 2 additional pieces to import private keys", controller.getWarning());
						controller.startOver();
						
						namedPieces = [];
						namedPieces.push({name: "piece0.json", piece: pieces[0]});
						namedPieces.push({name: "piece1.json", piece: pieces[1]});
						controller.addNamedPieces(namedPieces);
						assertEquals("Need 1 additional piece to import private keys", controller.getWarning());
						controller.startOver();
						
						namedPieces = [];
						namedPieces.push({name: "piece0.json", piece: pieces[0]});
						namedPieces.push({name: "piece1.json", piece: pieces[1]});
						namedPieces.push({name: "piece2.json", piece: pieces[2]});
						controller.addNamedPieces(namedPieces);
						assertEquals("", controller.getWarning());
						controller.startOver();
						
						onDone();
					}
				}
				
				function getPieces(plugins, keysPerPlugin, numPieces, minPieces) {
					var keys = [];
					numPieces = numPieces || 1;
					for (var i = 0; i < plugins.length; i++) {
						var plugin = plugins[i];
						for (var j = 0; j < keysPerPlugin; j++) {
							keys.push(plugin.newKey());
						}
					}
					return AppUtils.keysToPieces(keys, numPieces, minPieces);
				}
			});
		}
		
		function testPieceConversion(plugins, onDone) {
			console.log("testPieceConversion()");
			
			// generate unsplit piece
			var config = {};
			config.currencies = [];
			for (var i = 0; i < plugins.length; i++) {
				config.currencies.push({
					ticker: plugins[i].getTicker(),
					numKeys: 1,
					encryption: null
				})
			}
			AppUtils.generateKeys(config, null, function(err, keys, pieces) {
				assertUninitialized(err);
				assertEquals(1, pieces.length);
				testCsvConversion(pieces[0]);
				
				// generate split pieces
				config.numPieces = Tests.NUM_PIECES;
				config.minPieces = Tests.MIN_PIECES;
				AppUtils.generateKeys(config, null, function(err, keys, pieces) {
					assertUninitialized(err);
					for (var i = 0; i < pieces.length; i++) testCsvConversion(pieces[i]);
					onDone();
				});
			});
			
			function testCsvConversion(piece) {
				var csv = AppUtils.pieceToCsv(piece);
				var piece2 = AppUtils.csvToPiece(csv);
				assertEquals(piece, piece2);
			}
		}
	}
}