CXX ?= g++
FELLES = ../../felles
CXXFLAGS = -std=c++17 -O1 -g -Wall -Wextra -Werror -Wno-missing-field-initializers -Icore -I$(FELLES)
SAN = -fsanitize=address,undefined -fno-omit-frame-pointer
CORE = core/state.cpp core/view.cpp core/enhet.cpp core/api.cpp $(FELLES)/qrcodegen.cpp
HDR = $(wildcard core/*.h $(FELLES)/*.h $(FELLES)/*.hpp)
BUILD = build

.PHONY: test render dev esp32 e2e fonts clean

test: $(BUILD)/test_core
	./$(BUILD)/test_core

render: $(BUILD)/render

$(BUILD)/test_core: test/test_core.cpp $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) $(SAN) -o $@ test/test_core.cpp $(CORE)

$(BUILD)/render: tools/render.cpp $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) -O2 -o $@ tools/render.cpp $(CORE)

dev: $(BUILD)/devserver

$(BUILD)/devserver: tools/devserver.cpp $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) -O2 -o $@ tools/devserver.cpp $(CORE)

e2e: dev
	node test/e2e.mjs

# ESP32: kjernen kopieres inn i sketchen (arduino-cli bygger bare sketch-mappa), UI-et bakes inn som streng.
ARDUINO ?= /opt/arduino/arduino-cli
FQBN ?= esp32:esp32:esp32c3:CDCOnBoot=cdc,PartitionScheme=huge_app
esp32:
	rm -rf esp32/stafett/src && mkdir -p esp32/stafett/src
	cp core/*.h core/*.cpp $(FELLES)/*.h $(FELLES)/*.hpp $(FELLES)/*.cpp esp32/stafett/src/
	python3 tools/bake_web.py web/index.html esp32/stafett/src/web_index.h
	$(ARDUINO) compile --fqbn $(FQBN) --output-dir $(BUILD)/esp32 esp32/stafett

fonts:
	python3 $(FELLES)/genfont.py core/fonts.h F_BODY:Inter-Medium.otf:16:120 F_LABEL:Inter-Bold.otf:12:120 F_BIG:InterDisplay-Bold.otf:26:128 F_HUGE:InterDisplay-Bold.otf:44:128

clean:
	rm -rf $(BUILD) esp32/stafett/src
