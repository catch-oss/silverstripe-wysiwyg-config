<?php

use SilverStripe\Core\Config\Config;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use Silverstripe\SiteConfig\SiteConfig;
use SilverStripe\Core\Manifest\ModuleLoader;

// Define path constant
$path = str_replace('\\', '/', __DIR__);
$path_fragments = explode('/', $path);
$dir_name = $path_fragments[count($path_fragments) - 1];
define('CATCH_WYSIWYG_DIR', $dir_name);

$module = ModuleLoader::inst()->getManifest()->getModule('catchdesign/silverstripe-wysiwyg-config');

$cmsConfig = HTMLEditorConfig::get('cms');
$cmsConfig->disablePlugins('ssmedia');
$cmsConfig::get('cms')->enablePlugins([
    'semanticimage' => $module->getResource('js/semantic-image.js')
]);

$cmsConfig->setOption('extended_valid_elements', ['figure','figcaption']);
$arrayData = new SilverStripe\View\ArrayData();
$cmsConfig->setOption('silverstripe_wysiswg_config', [
    'template' => $arrayData->renderWith('semantic_image'),

    "elements" => [
        "wrapper" => "<figure></figure>",
        "caption" => "<figcaption class='caption'></figcaption>",
        "image" => "<img />"
    ],

    'classes' => [
        'left' => 'u-left',
        'leftAlone' => 'u-left u-alone',
        'right' => 'u-right',
        'rightAlone' => 'u-right u-alone',

        'wrapper' => 'c-image',
        'caption' => 'c-image-caption'
    ]
]);

$cmsConfig->addButtonsToLine(2, 'semanticimage');
