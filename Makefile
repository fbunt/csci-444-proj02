
HTML=$(wildcard src/*.html)
CSS=$(wildcard src/css/*.css)
JS=$(wildcard src/js/*.js)
JS_MAIN=src/js/main.js
DATA=$(wildcard data/*.json)

BUILD_DIR=./build/
BUILD_JS_DIR=$(BUILD_DIR)js/
BUILD_CSS_DIR=$(BUILD_DIR)css/
BUILD_CSS=$(addprefix $(BUILD_CSS_DIR),$(notdir $(CSS)))
BUILD_HTML=$(addprefix $(BUILD_DIR),$(notdir $(HTML)))
JS_BUNDLE=$(BUILD_JS_DIR)bundle.js
BUILD_JS=$(JS_BUNDLE)
BUILD_DATA_DIR=$(BUILD_DIR)data/
BUILD_DATA=$(addprefix $(BUILD_DATA_DIR),$(notdir $(DATA)))

JSC=browserify
SERVER=http-server


all: release

.PHONY: clean
clean:
	$(RM) -r $(BUILD_DIR)

.PHONY: run
run: release
	$(SERVER) $(BUILD_DIR) -o

.PHONY: serve
serve: release
	$(SERVER) $(BUILD_DIR)
	
release: $(BUILD_DIR) $(BUILD_CSS) $(BUILD_JS) $(BUILD_HTML) $(BUILD_DATA)

$(BUILD_DIR):
	mkdir -p $(BUILD_DIR)

$(BUILD_CSS): $(BUILD_DIR) $(BUILD_CSS_DIR) $(CSS)
	-cp $(CSS) $(BUILD_DIR_CSS) 2> /dev/null || true

$(BUILD_CSS_DIR):
	mkdir -p $(BUILD_CSS_DIR)

$(BUILD_JS): $(BUILD_JS_DIR) $(JS)
	$(JSC) $(JS_MAIN) -o $(JS_BUNDLE)

$(BUILD_JS_DIR):
	mkdir -p $(BUILD_JS_DIR)

$(BUILD_HTML): $(BUILD_DIR) $(HTML)
	cp $(HTML) $(BUILD_DIR)

$(BUILD_DATA): $(BUILD_DATA_DIR) $(DATA)
	$(eval d=$(addprefix data/,$(notdir $@)))
	-ln $(d) $@

$(BUILD_DATA_DIR):
	mkdir -p $(BUILD_DATA_DIR)
