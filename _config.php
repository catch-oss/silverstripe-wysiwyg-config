<?php

use SilverStripe\Core\Config\Config;
use Silverstripe\SiteConfig\SiteConfig;
use SilverStripe\Core\Manifest\ModuleLoader;
use SilverStripe\View\Parsers\ShortcodeParser;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use CatchDesign\SS\wysiwyg\Shortcodes\SemanticEmbeds;

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
    'SplitBlockquote' => $module->getResource('js/SplitBlockquote.js'),
    'semanticimage' => $module->getResource('js/semantic-image.js'),
    'semanticvideo' => $module->getResource('js/semantic-video.js'),
    'definitionlist' => $module->getResource('js/definitionlist/plugin.js')
]);

$cmsConfig->setContentCSS([$module->getResource('js/plugin-style.css')]);

// <figure class="c-picture captionImage Image leftAlone c-picture--left-offset" data-shortcode="image" data-id="11"><picture class="c-picture__item"> <img title="Grant Lilly Web" src="http://iod.loc/assets/Uploads/314f01e08b/Grant-Lilly-Web.jpg" alt="&quot;/" /> </picture>
// <figcaption class="ss-htmleditorfield-file image"></figcaption>
// </figure>

// <figure class="c-video ss-htmleditorfield-file embed" data-shortcode="embed" data-url="https://www.youtube.com/watch?v=MXs1cOlidWs">
// <div class="c-video__inner" data-url="https://www.youtube.com/watch?v=MXs1cOlidWs"><img class="placeholder" src="https://i.ytimg.com/vi/MXs1cOlidWs/hqdefault.jpg" alt="" /></div>
// <figcaption>asdads</figcaption>
// </figure>
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
                <img src="{{src}}" title="{{title}}" alt="{{alt}}" width="{{width}}" height="{{height}}" />
            </picture><figcaption class="">
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
            </div><figcaption>
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
