CXX ?= g++
FELLES = ../../felles
CXXFLAGS = -std=c++17 -O1 -g -Wall -Wextra -Werror -Wno-missing-field-initializers -Icore -I$(FELLES)
SAN = -fsanitize=address,undefined -fno-omit-frame-pointer
CORE = core/arkiv.cpp core/view.cpp core/enhet.cpp core/api.cpp $(FELLES)/dither.cpp $(FELLES)/qrcodegen.cpp
HDR = $(wildcard core/*.h $(FELLES)/*.h $(FELLES)/*.hpp)
LIBS =
BUILD = build

.PHONY: test render dev esp32 e2e fonts clean

test: $(BUILD)/test_core
	./$(BUILD)/test_core

$(BUILD)/test_core: test/test_core.cpp $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) $(SAN) -o $@ test/test_core.cpp $(CORE) $(LIBS)

render: $(BUILD)/render
$(BUILD)/render: tools/render.cpp tools/scene.h $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) -O2 -Wno-unused-function -o $@ tools/render.cpp $(CORE) $(LIBS)

dev: $(BUILD)/devserver
$(BUILD)/devserver: tools/devserver.cpp tools/scene.h $(FELLES)/devhttp.h $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) -O2 -Wno-unused-function -o $@ tools/devserver.cpp $(CORE) $(LIBS)

e2e: dev
	node test/e2e.mjs

ARDUINO ?= /opt/arduino/arduino-cli
FQBN ?= esp32:esp32:esp32s3:PSRAM=opi,FlashSize=16M,PartitionScheme=app3M_fat9M_16MB,CDCOnBoot=cdc
esp32:
	rm -rf esp32/vindusvakt/src && mkdir -p esp32/vindusvakt/src
	cp core/*.h core/*.cpp $(FELLES)/*.h $(FELLES)/*.hpp $(FELLES)/*.cpp esp32/vindusvakt/src/
	python3 ../../01-stafett/firmware/tools/bake_web.py web/index.html esp32/vindusvakt/src/web_index.h
	$(ARDUINO) compile --fqbn $(FQBN) --output-dir $(BUILD)/esp32 esp32/vindusvakt

fonts:
	python3 $(FELLES)/genfont.py core/fonts.h F_S:Inter-Bold.otf:13:120 F_M:Inter-Medium.otf:17:120 F_L:InterDisplay-Bold.otf:30:128 F_XL:InterDisplay-Bold.otf:84:128

clean:
	rm -rf $(BUILD) esp32/vindusvakt/src
