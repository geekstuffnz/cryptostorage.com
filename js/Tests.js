const REPEAT_LONG = 50;
const REPEAT_SHORT = 2;
const NUM_PIECES = 5;
const MIN_PIECES = 3;
const PASSWORD = "MySuperSecretPasswordAbcTesting123";
var counter = 0;

function runTests(callback) {
	testUtils();
	testPathTracker();
	testCryptoKeys(function(error) {
		if (callback) callback(error);
	});
}

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
}

function testPathTracker() {
	var tracker = new PathTracker(onUpdate);
	
	// assert initial state
	assertEquals(-1, tracker.getIndex());
	assertEquals(0, tracker.getItems().length);
	assertFalse(tracker.hasNext());
	assertFalse(tracker.hasPrev());
	assertNull(tracker.current());
	try {
		tracker.next();
		throw new Error("fail");
	} catch (err) {
		if (err.message === "fail") throw err;
	}
	try {
		tracker.prev();
		throw new Error("fail");
	} catch (err) {
		if (err.message === "fail") throw err;
	}
	
	// add item
	tracker.next("1");
	assertEquals("1", tracker.current());
	assertFalse(tracker.hasPrev());
	assertFalse(tracker.hasNext());
	try {
		tracker.next();
		throw new Error("fail");
	} catch (err) {
		if (err.message === "fail") throw new Error("fail");
	}
	try {
		tracker.prev();
		throw new Error("fail");
	} catch (err) {
		if (err.message === "fail") throw new Error("fail");
	}
	
	// add another item
	tracker.next("2");
	assertEquals("2", tracker.current());
	assertTrue(tracker.hasPrev());
	assertFalse(tracker.hasNext());
	assertEquals("1", tracker.prev());
	assertEquals("1", tracker.current());
	assertTrue(tracker.hasNext());
	assertFalse(tracker.hasPrev());
	assertEquals("2", tracker.next());
	assertTrue(tracker.hasPrev());
	assertFalse(tracker.hasNext());
	
	// test current
	try {
		tracker.current("3");
		throw new Error("fail");
	} catch (err) {
		if (err.message === "fail") throw err;
	}
	tracker.current("1");
	assertFalse(tracker.hasPrev());
	assertTrue(tracker.hasNext());
	assertEquals("2", tracker.next());
	assertEquals("3", tracker.next("3"));
	assertFalse(tracker.hasNext());
	assertTrue(tracker.hasPrev());
	assertEquals("2", tracker.prev());
	assertTrue(tracker.hasNext());
	assertTrue(tracker.hasPrev());
	assertEquals("1", tracker.prev());
	assertEquals("2", tracker.next("2"));
	assertTrue(tracker.hasPrev());
	assertFalse(tracker.hasNext());
	
	function onUpdate(lastIdx, curIdx, item) {
		assertNotNull(lastIdx);
		assertNotNull(curIdx);
		assertNotNull(item);
	}
}

function testCryptoKeys(callback) {
	let funcs = [];
	for (let plugin of getCryptoPlugins()) funcs.push(function(callback) { testCryptoKey(plugin, callback); });
	async.series(funcs, callback);
}

function testCryptoKey(plugin, callback) {
	console.log("testCryptoKey(" + plugin.getTickerSymbol() + ")");
	
	// test plugin
	assertInitialized(plugin.getName());
	assertInitialized(plugin.getTickerSymbol());
	assertInitialized(plugin.getLogo());
	
	// test unencrypted keys
	for (let i = 0; i < REPEAT_LONG; i++) {
		
		// create new key
		let key = plugin.newKey();
		assertInitialized(key.getHex());
		assertInitialized(key.getWif());
		assertInitialized(key.getAddress());
		assertNull(key.getEncryptionScheme());
		let copy = key.copy();
		assertTrue(key.equals(copy));
		
		// parse unencrypted hex
		let key2 = new CryptoKey(plugin, key.getHex());
		assertTrue(key.equals(key2));
		
		// parse unencrypted wif
		key2 = new CryptoKey(plugin, key.getWif());
		assertTrue(key.equals(key2));
	}
	
	// test invalid private keys
	let invalids = [null, "abctesting123", "abc testing 123", 12345, plugin.newKey().getAddress()];
	for (let invalid of invalids) {
		try {
			new CryptoKey(plugin, invalid);
			fail("Should have thrown an error");
		} catch (error) { }
	}
	
	// parse undefined
	try {
		plugin.newKey(undefined);
		fail("Should have thrown an error");
	} catch (error) { }
	
	// test each encryption scheme
	assertTrue(plugin.getEncryptionSchemes().length >= 1);
	let funcs = [];
	for (let scheme of plugin.getEncryptionSchemes()) funcs.push(function(callback) { testEncryptionScheme(plugin, scheme, callback); });
	async.parallel(funcs, callback);
	
	// test one encryption scheme
	function testEncryptionScheme(plugin, scheme, callback) {
		let max = scheme === EncryptionScheme.BIP38 ? REPEAT_SHORT : REPEAT_LONG;	// bip38 takes a long time
		let funcs = [];
		for (let i = 0; i < max; i++) funcs.push(function(callback) { testEncryption(plugin, scheme, PASSWORD, PASSWORD, callback); });
		funcs.push(function(callback) { testEncryption(plugin, scheme, PASSWORD, "invalidPassword123", callback); });	// test wrong password
		async.parallel(funcs, callback);
	}
	
	// test encryption of one key
	function testEncryption(plugin, scheme, encryptionPassword, decryptionPassword, callback) {
		let key = plugin.newKey();
		let original = key.copy();
		key.encrypt(scheme, encryptionPassword, function(encryptedKey, err) {
			if (err) callback(err);
			else {
				
				// test basic initialization
				assertTrue(key.equals(encryptedKey));
				assertInitialized(key.getHex());
				assertInitialized(key.getWif());
				assertInitialized(key.getAddress());
				assertEquals(scheme, key.getEncryptionScheme());
				assertTrue(key.isEncrypted());
				
				// test original
				assertFalse(key.equals(original));
				assertTrue(key.equals(key.copy()));
				
				// test consistency
				let parsed = new CryptoKey(plugin, key.getHex());
				assertEquals(key.getHex(), parsed.getHex());
				assertEquals(key.getWif(), parsed.getWif());
				assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
				parsed = new CryptoKey(plugin, key.getWif());
				assertEquals(key.getHex(), parsed.getHex());
				assertEquals(key.getWif(), parsed.getWif());
				assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
				
				// test decryption
				testDecryption(key, encryptionPassword, decryptionPassword, original, callback);
			}
		});
	}
	
	// test decryption of one key
	function testDecryption(key, encryptionPassword, decryptionPassword, expected, callback) {
		key.decrypt(decryptionPassword, function(decryptedKey, err) {
			if (encryptionPassword !== decryptionPassword) {
				if (!err) callback(new Error("Decryption with wrong password should throw an error"));
				else callback();
			} else {
				if (err) callback(err);
				else {
					
					// test basic initialization
					assertTrue(key.equals(decryptedKey));
					assertInitialized(key.getHex());
					assertInitialized(key.getWif());
					assertInitialized(key.getAddress());
					assertNull(key.getEncryptionScheme());
					
					// test decryption and copy
					assertTrue(key.equals(expected));
					assertTrue(key.equals(key.copy()));
					
					// test consistency
					let parsed = new CryptoKey(plugin, key.getHex());
					assertEquals(key.getHex(), parsed.getHex());
					assertEquals(key.getWif(), parsed.getWif());
					assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
					parsed = new CryptoKey(plugin, key.getWif());
					assertEquals(key.getHex(), parsed.getHex());
					assertEquals(key.getWif(), parsed.getWif());
					assertEquals(key.getEncryptionScheme(), parsed.getEncryptionScheme());
					callback();
				}
			}
		});
	}
}

function testSplitWallet(wallet, numPieces, minPieces) {
	
	// ensure wallet is not split
	assertFalse(wallet.isSplit());
	var original = wallet.copy();
	assertTrue(original.equals(wallet));
	
	// split and test
	wallet.split(numPieces, minPieces);
	assertTrue(wallet.isSplit());
	assertEquals(numPieces, wallet.getCryptoKeyPieces().length);
	assertUndefined(wallet.isEncrypted());
	assertUndefined(wallet.getEncryptionScheme());
	assertUndefined(wallet.getCryptoKey());
	
	// test reconstituting each combination
	var pieceCombinations = getCombinations(wallet.getCryptoKeyPieces(), minPieces);
	for (let pieceCombinationIdx = 0; pieceCombinationIdx < pieceCombinationIdx.length; pieceCombinationIdx++) {
		var pieceCombination = pieceCombinations[pieceCombinationIdx];
		var reconstituted = new Wallet(plugin, {privateKeyPieces: pieceCombination}).reconstitute();
		assertTrue(reconstituted.equals(original));
	}
	
	// reconstitute entire wallet
	wallet.reconstitute();
	assertTrue(wallet.equals(original));
}