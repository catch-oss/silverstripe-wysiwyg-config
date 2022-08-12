<?php


namespace CatchDesign\SS\wysiwyg\Shortcodes;

use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use SilverStripe\View\Embed\Embeddable;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Dev\Debug;
use SilverStripe\View\Embed\EmbedContainer;
use SilverStripe\View\Embed\EmbedResource;

/**
 * Provider for the [embed] shortcode tag used by the embedding service
 * in the HTML Editor field.
 * Provides the html needed for the frontend and the editor field itself.
 */
class SemanticEmbeds
{

    /**
     * Gets the list of shortcodes provided by this handler
     *
     * @return mixed
     */
    public static function get_shortcodes()
    {
        return array('semanticimage', 'semanticvideo');
    }

    private static $casting = [
        'SemanticImage' => 'HTMLText',
        'SemanticVideo' => 'HTMLText'
    ];

    public static function template($template, $array)
    {
        return preg_replace_callback('/\{\{\s*(\S*)\s*\}\}/', function ($matches) use ($array) {
            return ((isset($array[$matches[1]])) ? $array[$matches[1]] : '');
        }, $template);
    }


    public static function SemanticVideo($arguments, $content = null, $parser = null, $tagName = null)
    {
        if (!empty($content)) {
            $serviceURL = $content;
        } elseif (!empty($arguments['url'])) {
            $serviceURL = $arguments['url'];
        } else {
            return '';
        }

        $embed = Injector::inst()->create(Embeddable::class, $serviceURL);

        if (is_a($embed, EmbedResource::class)) {
            $embed = $embed->getEmbed();
            $code = $embed->getCode();
        } elseif (is_a($embed, EmbedContainer::class)) {
            $extractor = $embed->getExtractor();
            $code = $extractor->code;
        } else {
            return '';
        }

        $replacements = [
            'classes' => $arguments['class'] ?? '',
            'video' => $code,
            'caption' => $arguments['caption'] ?? '',
            'data-shortcode' => 'semanticvideo',
            'data-url' => $arguments['url'] ?? ''
        ];

        $cmsConfig = HTMLEditorConfig::get('cms');
        $settings = $cmsConfig->getOption('wysiswg_semantic_video');

        $template = SemanticEmbeds::template($settings['template'], $replacements);
        return $template;
    }

    public static function SemanticImage($arguments, $content = null, $parser = null, $tagName = null)
    {

        if (!empty($content)) {
            $serviceURL = $content;
        } elseif (!empty($arguments['url'])) {
            $serviceURL = $arguments['url'];
        } else {
            return '';
        }

        $embed = Injector::inst()->create(Embeddable::class, $serviceURL);

        if (is_a($embed, EmbedResource::class)) {
            $embed = $embed->getEmbed();
            $url = $embed->getUrl();
        } elseif (is_a($embed, EmbedContainer::class)) {
            $url = $embed->url;
        } else {
            return '';
        }

        // Debug::show($embed);
        // die;

        $replacements = [
            'classes' => $arguments['class'] ?? '',
            'title' => $arguments['title'] ?? '',
            'alt' => $arguments['alt'] ?? '',
            'caption' => $arguments['caption'] ?? '',
            'data-shortcode' => 'semanticimage',
            'src' => $url,
            'data-id' => 'data-id'
        ];

        $cmsConfig = HTMLEditorConfig::get('cms');
        $settings = $cmsConfig->getOption('wysiswg_semantic_image');

        $template = SemanticEmbeds::template($settings['template'], $replacements);


        return $template;
    }
}
