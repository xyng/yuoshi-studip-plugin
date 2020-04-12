<?php
namespace Xyng\Yuoshi\Helper;

use HtmlSanitizer\Sanitizer;

class HtmlSanitizerFactory {
    public static function create() {
        /**
         * @see https://github.com/tgalopin/html-sanitizer
         */
        return Sanitizer::create([
            'extensions' => ['basic', 'list', 'table'],
            'tags' => [
                'a' => [
                    'allowed_attributes' => ['title'] // remove href for links so they cannot be used for xss.
                ],
            ]
        ]);
    }

}
