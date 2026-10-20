CXX ?= g++
CXXFLAGS = -std=c++17 -O1 -g -Wall -Wextra -Werror -Wno-missing-field-initializers
SAN = -fsanitize=address,undefined -fno-omit-frame-pointer
CORE = core/state.cpp core/view.cpp core/qrcodegen.cpp
HDR = $(wildcard core/*.h core/*.hpp)
BUILD = build

.PHONY: test render fonts clean

test: $(BUILD)/test_core
	./$(BUILD)/test_core

render: $(BUILD)/render

$(BUILD)/test_core: test/test_core.cpp $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) $(SAN) -o $@ test/test_core.cpp $(CORE)

$(BUILD)/render: tools/render.cpp $(CORE) $(HDR)
	@mkdir -p $(BUILD)
	$(CXX) $(CXXFLAGS) -O2 -o $@ tools/render.cpp $(CORE)

fonts:
	python3 tools/genfont.py

clean:
	rm -rf $(BUILD)
