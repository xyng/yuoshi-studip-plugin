<?php
namespace Xyng\Yuoshi\Api\Controller;

use JsonApi\Errors\RecordNotFoundException;
use JsonApi\JsonApiController;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;
use Xyng\Yuoshi\Api\Authority\TaskAuthority;
use Xyng\Yuoshi\Model\TaskContentQuests;
use Xyng\Yuoshi\Model\TaskContents;
use Xyng\Yuoshi\Model\Tasks;
use Xyng\Yuoshi\Model\UserTaskSolutions;

class TaskSolutionsController extends JsonApiController
{
    protected $allowedPagingParameters = ['offset', 'limit'];
    protected $allowedFilteringParameters = ['sequence'];

    public function create(ServerRequestInterface $request, ResponseInterface $response, $args) {
        $body = $request->getParsedBody();
        $data = $body['data'] ?? null;

        if (!$data) {
            // todo: better exceptions
            throw new \InvalidArgumentException();
        }

        $task_id = $data['attributes']['task_id'];
        $task = Tasks::findWithQuery([
            'joins' => [
                [
                    'sql' => TaskAuthority::filterByUsersPackages(),
                    'params' => [
                        'user_id' => $this->getUser($request)->id
                    ]
                ]
            ],
            'conditions' => [
                'yuoshi_tasks.id' => $task_id,
            ]
        ]);

        if (!$task) {
            throw new RecordNotFoundException();
        }

        $content_solutions = [];
        $raw_content_solutions = $data['relationships']['content_solutions'] ?? [];
        foreach ($raw_content_solutions as $content_solution) {
            $content_solution_data = $content_solution['data'];

            $content_id = $content_solution_data['attributes']['content_id'];
            $content = TaskContents::findWhere([
                'id' => $content_id,
                'task_id' => $task_id,
            ]);

            if (!$content) {
                throw new RecordNotFoundException();
            }

            $quest_solutions = [];
            $raw_quest_solutions = $content_solution_data['relationships']['content_quest_solutions'] ?? [];

            foreach ($raw_quest_solutions as $quest_solution) {
                $quest_solution_data = $quest_solution['data'];

                $quest_id = $quest_solution_data['attributes']['quest_id'];
                $quest = TaskContentQuests::findWhere([
                    'id' => $quest_id,
                    'content_id' => $content_id,
                ]);

                if (!$quest) {
                    throw new RecordNotFoundException();
                }

                /*
                    NOTE: the answer is not checked by intention.
                    there are some task-types (like drag) that require the user
                    to find the correct answer to a question.
                    in order to persist wrong instances, there may be entries with
                    non-matching quest_id and answer_id.
                */

                $quest_solutions[] = [
                    'quest_id' => $quest_id,
                    'answer_id' => $quest_solution_data['attributes']['answer_id'],
                ];
            }

            $content_solutions[] = [
                'content_id' => $content_id,
                'value' => $content_solution_data['attributes']['value'] ?? null,
                'quest_solutions' => $quest_solutions,
            ];
        }

        $result = UserTaskSolutions::import([
            'task_id' => $task_id,
            'user_id' => $this->getUser($request)->id,
            'content_solutions' => $content_solutions,
        ]);

        $result->store();

        dd($result);
    }
}
