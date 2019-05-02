<?php

use SilverStripe\Core\Config\Config;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use Silverstripe\SiteConfig\SiteConfig;

// Define path constant
$path = str_replace('\\', '/', __DIR__);
$path_fragments = explode('/', $path);
$dir_name = $path_fragments[count($path_fragments) - 1];
define('CATCH_WYSIWYG_DIR', $dir_name);

$cmsConfig = HTMLEditorConfig::get('cms');
$cmsConfig->disablePlugins('ssmedia');
$cmsConfig::get('cms')->enablePlugins(['semantic-image' => ABC_WYSIWYG_DIR . '/js/semantic-image.js']);
$cmsConfig->setOption('extended_valid_elements', ['figure','figcaption']);

$cmsConfig->addButtonsToLine(2, 'semantic-image');
