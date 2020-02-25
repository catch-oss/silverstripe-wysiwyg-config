<?php


namespace CatchDesign\SS\wysiwyg\Controller;

use SilverStripe\Assets\File;
use SilverStripe\Control\Controller;
use SilverStripe\Control\Director;
use SilverStripe\Control\HTTPRequest;
use SilverStripe\Forms\HTMLEditor\HTMLEditorConfig;
use SilverStripe\View\Embed\Embeddable;
use SilverStripe\Core\Injector\Injector;
use SilverStripe\Dev\Debug;

class ImageResampleController extends Controller
{
    private static   $allowed_actions = [
        'resample' => 'CMS_ACCESS_CMSMain'
    ];

    /**
     * Will return the absolute URL of a resampled image by providing the File ID and width, height
     * The user must have CMS access permissions
     *
     * @param HTTPRequest $request
     * @return string
     */
    public function resample(HTTPRequest $request): string
    {
        $payload = $request->requestVars() ? (object) $request->requestVars() : json_decode($request->getBody());
        $imageID = $payload->id ?? 0;
        $height = $payload->height ?? 0;
        $width =  $payload->width ?? 0;
        if (!$imageID || !$height || !$width) {
            return '';
        }

        $file = File::get_by_id($imageID);
        if (!$file) {
            return '';
        }

        $file = $file->Fill($width, $height);
        return $file->getAbsoluteURL();
    }
}
