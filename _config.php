<?php

use SilverStripe\Core\Config\Config;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use Silverstripe\SiteConfig\SiteConfig;
use SilverStripe\Core\Manifest\ModuleLoader;
use SilverStripe\View\Parsers\ShortcodeParser;

// Define path constant
$path = str_replace('\\', '/', __DIR__);
$path_fragments = explode('/', $path);
$dir_name = $path_fragments[count($path_fragments) - 1];
define('CATCH_WYSIWYG_DIR', $dir_name);

$module = ModuleLoader::inst()->getManifest()->getModule('catchdesign/silverstripe-wysiwyg-config');

$cmsConfig = HTMLEditorConfig::get('cms');
$cmsConfig->disablePlugins('ssmedia');
$cmsConfig->disablePlugins('ssembed');
$cmsConfig::get('cms')->enablePlugins([
    'semanticimage' => $module->getResource('js/semantic-image.js'),
    'semanticvideo' => $module->getResource('js/semantic-video.js')
]);

$cmsConfig->setOption('extended_valid_elements', [
    'figure[data-shortcode|data-url|class]',
    'figcaption',
    'picture',
    'small',
    'iframe[src|style|width|height|scrolling|marginwidth|marginheight|frameborder|data*]',
    'div',
    'div[data-url|class|data-shortcode|data-id|class]',
    'p[data-url|class|data-shortcode|data-id|class]'
]);

$arrayData = new SilverStripe\View\ArrayData();
$cmsConfig->setOption('wysiswg_semantic_image', [

    'template' => '
        <figure class="c-picture {{ classes }}" data-id="{{data-id}}" data-shortcode="{{data-shortcode}}" >
            <picture class="c-picture__item">
                <img src="{{src}}" title="{{title}}" alt="{{alt}}" />
            </picture>
            <figcaption class="">
                {{caption}}
            </figcaption>
        </figure>',

    'classes' => [
        'left' => 'c-picture--left',
        'leftAlone' => 'c-picture--left-offset',
        'right' => 'c-picture--right',
        'rightAlone' => 'c-picture--right-offset',
    ],

    'selectors' => [
        'wrapper' => '.c-picture',
        'caption' => 'figcaption'
    ]
]);

$cmsConfig->setOption('wysiswg_semantic_video', [
    'template' => '
        <figure class="c-video {{ classes }}" data-shortcode="{{data-shortcode}}" data-url="{{ data-url }}">
            <div class="c-video__inner" data-url="{{ data-url }}">
                {{video}}
            </div>
            <figcaption>
                {{caption}}
            </figcaption>
        </figure>',

    'classes' => [
        'left' => 'c-video--left',
        'leftAlone' => 'c-video--left-offset',
        'right' => 'c-video--right',
        'rightAlone' => 'c-video--right-offset',
    ],

    'selectors' => [
        'wrapper' => '.c-video',
        'caption' => 'figcaption'
    ]
]);

$cmsConfig->addButtonsToLine(2, 'semanticimage');
$cmsConfig->addButtonsToLine(2, 'semanticvideo');

ShortcodeParser::get('default')->register('semanticvideo', ['CatchDesign\SS\wysiwyg\Shortcodes\SemanticEmbeds', 'SemanticVideo']);
ShortcodeParser::get('default')->register('semanticimage', ['CatchDesign\SS\wysiwyg\Shortcodes\SemanticEmbeds', 'SemanticImage']);
