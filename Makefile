build: dist vendor
	composer run zip

dist: app node_modules package.json yarn.lock
	yarn run build

node_modules:
	yarn

vendor: composer.json composer.lock
	composer install

clean:
	rm -rf vendor/ node_modules/ dist/ yuoshi.zip
