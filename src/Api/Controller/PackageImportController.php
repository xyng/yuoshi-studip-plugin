<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\NonJsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Xyng\Yuoshi\Authority\PackageAuthority;
use Xyng\Yuoshi\Model\Packages;
use Xyng\Yuoshi\Helper\PermissionHelper;

class PackageImportController extends NonJsonApiController
{
    public function import(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $course_id = $args['course_id'] ?? null;

        $file = $request->getUploadedFiles()["file"] ?? null;
        if (!$file) {
            throw new \JsonApi\Errors\BadRequestException();
        }
        $stream = $file->getStream();

        $package = Packages::import(json_decode($stream->getContents(), true)["package"] ?? []);
        $package->course_id = $course_id;

        $package->store();
    }

    public function export(ServerRequestInterface $request, ResponseInterface $response, $args)
    {
        $package_id = $args['package_id'] ?? null;

        if (!$package_id) {
            throw new RecordNotFoundException();
        }
        
        /** @var Packages $package */
        $package = PackageAuthority::findOneFiltered($package_id, $this->getUser($request), PermissionHelper::getMasters('dozent'));

        $export = [];

        $export["package"] = $package->toArrayRecursive([
            "title",
            "slug",
            "sort",
            "stations" => [
                "title",
                "slug",
                "sort",
                "tasks" => [
                    "title",
                    "sort",
                    "is_training",
                    "image",
                    "kind",
                    "description",
                    "credits",
                    "contents" => [
                        "intro",
                        "outro",
                        "title",
                        "content",
                        "quests" => [
                            "name",
                            "image",
                            "prephrase",
                            "question",
                            "multiple",
                            "sort",
                            "require_order",
                            "custom_answer",
                            "answers" => [
                                "content",
                                "is_correct",
                                "sort"
                            ]
                        ]
                    ]
                ]
            ],
            
        ]);
        $stream = $response->getBody();
        $stream->write(json_encode($export));
        return $response
            ->withBody($stream)
            ->withAddedHeader('Content-Disposition', 'attachment; filename="yuoshi_export.json"')
            ->withAddedHeader("Content-Type", "application/json");
    }
}
