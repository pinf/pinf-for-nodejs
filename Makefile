
REPORTER ?= list

test:
	@./node_modules/.bin/mocha \
		--reporter $(REPORTER) \
		test/*.js

.PHONY: test
