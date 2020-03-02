<?php
namespace Xyng\Yuoshi\Controller;

use Context;
use PluginController;
use Xyng\Yuoshi\Model\Packages;
use Xyng\Yuoshi\Model\Tasks;

class IndexController extends PluginController {
    public function index_action() {
        $course = Context::get();

        /** @var Packages $package */
        $package = Packages::findOneByCourse_id($course->id);
        if (!$package) {
            return;
        }

        dump($package->toArrayRecursive([
            '*',
            'tasks' => [
                'contents' => [
                    'quests' => [
                        'answers'
                    ]
                ]
            ]
        ]));
    }

    public function create_action() {
        $course = Context::get();

        /** @var Packages $package */
        $package = Packages::findOneByCourse_id($course->id);
        if (!$package) {
            $package = Packages::create([
                'title' => 'Default Package',
                'course_id' => $course->id,
            ]);
        }

        $task = Tasks::import([
            'package_id' => $package->id,
            'title' => 'Motivation 1',
            'contents' => [
                [
                    'title' => 'Der erste Task!',
                    'intro' => 'Dies ist der Intro text',
                    'outro' => 'Dies ist der Outro Text',
                    'quests' => [
                        [
                            'title' => 'Mustafa',
                            'prePhrase' => 'Pre Phrase',
                            'question' => 'Verkaufte Mustafa Nüsse am Basar?',
                            'content' => 'Inhalt.',
                            'multiple' => false,
                            'answers' => [
                                [
                                    'content' => 'Ja, er sah Suleika, schön und wunderbar'
                                ],
                                [
                                    'content' => 'Nö.'
                                ]
                            ]
                        ]
                    ]
                ]
            ]
        ]);

        dd($task->store());
    }
}
