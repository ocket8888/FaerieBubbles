TSC := "tsc"

TSCLIBS ?= "dom,es2018"
TSCFLAGS ?= --strict --noImplicitAny --noImplicitThis --noUnusedLocals --noImplicitReturns --alwaysStrict --noUnusedParameters
TARGET ?= "ES2018"

SOURCE := $(wildcard *.ts)
OUTFILES := $(patsubst %.ts,%.js,$(SOURCE))

.PHONY: all clean

all: $(OUTFILES)
	# Don't ask me why this is necessary
# 	$(foreach o,$(OUTFILES),$(shell sed -ri 's/from "\.\/(.+)";/from "\.\/\1\.js";/g' $(o)))

clean:
	$(RM) $(OUTFILES)

%.js: %.ts
	$(TSC) --lib $(TSCLIBS) $(TSCFLAGS) --target $(TARGET) $<
