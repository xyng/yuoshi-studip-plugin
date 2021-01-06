<?php
namespace Xyng\Yuoshi\Api\Controller;

use File;
use FileRef;
use Folder;
use JsonApi\Errors\InternalServerError;
use JsonApi\Errors\RecordNotFoundException;
use JsonApi\Errors\UnprocessableEntityException;
use JsonApi\NonJsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Psr\Http\Message\UploadedFileInterface;
use SimpleORMap;
use Slim\Http\Stream;
use StandardFolder;
use User;
use Xyng\Yuoshi\Authority\TaskAuthority;
use Xyng\Yuoshi\Authority\TaskContentAuthority;
use Xyng\Yuoshi\Authority\TaskContentQuestAnswerAuthority;
use Xyng\Yuoshi\Authority\TaskContentQuestAuthority;
use Xyng\Yuoshi\Helper\DBHelper;
use Xyng\Yuoshi\Helper\PermissionHelper;
use Xyng\Yuoshi\Model\TaskContentQuestAnswers;
use Xyng\Yuoshi\Model\TaskContentQuests;
use Xyng\Yuoshi\Model\TaskContents;

class ImagesController extends NonJsonApiController {
    public function show(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $image_id = $args['image_id'] ?? null;

        if (!$image_id) {
            return $response->withStatus(404);
        }

        try {
            $fileRef = $this->findFileRef($image_id, $request);
        } catch (RecordNotFoundException $e) {
            return $response->withStatus(404);
        } catch (\Exception $e) {
            return $response->withStatus(500);
        }

        /** @var File $file */
        $file = $fileRef->file;

        if (!file_exists($file->getPath())) {
            return $response->withStatus(404);
        }

        $resource = fopen($file->getPath(), 'r');
        return $response->withStatus(200)->withHeader('Content-Type', $file->mime_type)->withBody(
            new Stream($resource)
        );
    }

    /**
     * @param ServerRequestInterface $request
     * @param string $perm
     * @return SimpleORMap|TaskContentQuestAnswers|TaskContentQuests|TaskContents
     */
    protected function findEntity(ServerRequestInterface $request, string $perm) {
        $body = $request->getParsedBody();

        $type = $body['type'] ?? null;
        $id = $body['id'] ?? null;

        if (!$type || !$id) {
            throw new UnprocessableEntityException();
        }

        $user = $this->getUser($request);

        $req_perms = PermissionHelper::getMasters($perm);

        switch ($type) {
            case "content":
                $entity = TaskContentAuthority::findOneFiltered($id, $user, $req_perms);
                break;
            case "quest":
                $entity = TaskContentQuestAuthority::findOneFiltered($id, $user, $req_perms);
                break;
            case "answer":
                $entity = TaskContentQuestAnswerAuthority::findOneFiltered($id, $user, $req_perms);
                break;
            default:
                throw new \InvalidArgumentException("unknown entity type");
        }

        if (!$entity) {
            throw new RecordNotFoundException();
        }

        return $entity;
    }

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args) {
        /** @var UploadedFileInterface|null $image */
        $image = $request->getUploadedFiles()['image'] ?? null;

        if (!$image) {
            throw new UnprocessableEntityException();
        }

        $entity = $this->findEntity($request, 'dozent');

        /** @var Folder|null $dbFolder */
        $dbFolder = \Folder::findOneBySQL(
            "parent_id='' AND range_id = :range_id AND range_type = :range_type",
            [
                'range_id' => $entity->id,
                'range_type' => get_class($entity),
            ]
        );

        if (!$dbFolder) {
            $dbFolder = \Folder::createTopFolder($entity->id, get_class($entity), 'StandardFolder');
        }

        if (!$dbFolder) {
            throw new InternalServerError("could not create folder");
        }

        /** @var StandardFolder $folder */
        $folder = $dbFolder->getTypedFolder();

        $file = new File();
        $file->name = $dbFolder->getUniqueName(md5($image->getClientFilename() ?: uniqid()));
        $file->mime_type = $image->getClientMediaType();
        $file->size = $image->getSize();
        $file->storage = 'disk';
        $file->user_id = $this->getUser($request)->id;
        $file->id = $file->getNewId();

        $this->updateFile($file, $image);

        $fileRef = $folder->createFile($file);

        $stream = new Stream(fopen('php://temp', 'r+'));
        $stream->write(json_encode([
            'file' => $fileRef->id
        ]));

        return $response
            ->withHeader(
                'Content-Type',
                'application/json'
            )
            ->withStatus(201)
            ->withBody($stream);
    }

    public function update(ServerRequestInterface $request, ResponseInterface $response, $args) {
        /** @var UploadedFileInterface|null $image */
        $image = $request->getUploadedFiles()['image'] ?? null;

        if (!$image) {
            throw new UnprocessableEntityException();
        }

        $image_id = $args['image_id'] ?? null;

        if (!$image_id) {
            throw new RecordNotFoundException();
        }

        $fileRef = $this->findFileRef($image_id, $request, 'dozent');

        /** @var File $file */
        $file = $fileRef->file;

        $this->updateFile($file, $image);
        $file->size = $image->getSize();
        $file->mime_type = $image->getClientMediaType();

        $file->store();

        return $response->withStatus(204);
    }

    /**
     * Find FileRef by ID, scoped by TaskContent, TaskContentQuest or TaskContentQuestAnswer
     *
     * @param string $id ID of file
     * @param ServerRequestInterface $request Server request
     * @param string|null $perm (optional) required user permissions in TaskContent
     * @return FileRef|null
     */
    protected function findFileRef(string $id, ServerRequestInterface $request, string $perm = null) {
        $conditions = $perm ? [
            'seminar_user.status IN' => PermissionHelper::getMasters($perm)
        ] : [];

        // filter file-ref of image by related content,
        // or content that belongs to related quest,
        // or content that belongs to a quest that belongs to a related answer
        // SO MANY OPTIONS!
        // it's ugly, but it works!
        ['sql' => $sql, 'params' => $params] = DBHelper::queryToSql([
            'conditions' => [
                'file_refs.id' => $id
            ],
            'joins' => [
                [
                    'sql' => 'INNER JOIN folders on (folders.id = file_refs.folder_id)'
                ],
                [
                    'sql' => 'LEFT JOIN yuoshi_task_content_quest_answers on (yuoshi_task_content_quest_answers.id = folders.range_id and folders.range_type = :task_content_quest_answer_range_type)',
                    'params' => [
                        'task_content_quest_answer_range_type' => TaskContentQuests::class,
                    ]
                ],
                [
                    'sql' => 'LEFT JOIN yuoshi_task_content_quests on (yuoshi_task_content_quests.id = folders.range_id and folders.range_type = :task_content_quest_range_type) or (yuoshi_task_content_quests.id = yuoshi_task_content_quest_answers.quest_id)',
                    'params' => [
                        'task_content_quest_range_type' => TaskContentQuests::class,
                    ]
                ],
                [
                    'sql' => 'INNER JOIN yuoshi_task_contents on (yuoshi_task_contents.id = folders.range_id and folders.range_type = :task_content_range_type) or (yuoshi_task_contents.id = yuoshi_task_content_quests.content_id)',
                    'params' => [
                        'task_content_range_type' => TaskContents::class,
                    ]
                ],
                [
                    'sql' => TaskContentAuthority::getFilter(),
                    'params' => [
                        'user_id' => $this->getUser($request)->id
                    ],
                    'conditions' => $conditions,
                ],
            ]
        ]);

        /** @var FileRef|null $fileRef */
        $fileRef = \FileRef::findOneBySQL($sql, $params);

        if (!$fileRef) {
            throw new RecordNotFoundException();
        }

        return $fileRef;
    }

    protected function updateFile(File $file, UploadedFileInterface $image)
    {
        $newPath = $file->getPath();
        if (!is_dir(pathinfo($newPath, PATHINFO_DIRNAME))) {
            mkdir(pathinfo($newPath, PATHINFO_DIRNAME), 0777,true);
        }

        $image->moveTo($file->getPath());
    }
}
