<?php

use JsonApi\Contracts\JsonApiPlugin;
use Xyng\Yuoshi\Api\Controller\PackagesController;
use Xyng\Yuoshi\Api\Controller\PackageImportController;
use Xyng\Yuoshi\Api\Controller\TaskContentQuestAnswersController;
use Xyng\Yuoshi\Api\Controller\TaskContentQuestsController;
use Xyng\Yuoshi\Api\Controller\TaskContentQuestSolutionsController;
use Xyng\Yuoshi\Api\Controller\TaskContentsController;
use Xyng\Yuoshi\Api\Controller\TaskContentSolutionsController;
use Xyng\Yuoshi\Api\Controller\TasksController;
use Xyng\Yuoshi\Api\Controller\TaskSolutionsController;
use Xyng\Yuoshi\Api\Controller\StationController;

class Yuoshi extends StudIPPlugin implements StandardPlugin, SystemPlugin, JsonApiPlugin
{
    public function __construct()
    {
        parent::__construct();

        // Enable this when changing tables.
        // SimpleORMap::expireTableScheme();

        require_once 'vendor/autoload.php';
    }

    /**
     * Return a template (an instance of the Flexi_Template class)
     * to be rendered on the course summary page. Return NULL to
     * render nothing for this plugin.
     *
     * The template will automatically get a standard layout, which
     * can be configured via attributes set on the template:
     *
     *  title        title to display, defaults to plugin name
     *  icon_url     icon for this plugin (if any)
     *  admin_url    admin link for this plugin (if any)
     *  admin_title  title for admin link (default: Administration)
     *
     * @return object   template object to render or NULL
     */
    public function getInfoTemplate($course_id)
    {
        // TODO: Implement getInfoTemplate() method.
    }

    /**
     * Return a navigation object representing this plugin in the
     * course overview table or return NULL if you want to display
     * no icon for this plugin (or course). The navigation object's
     * title will not be shown, only the image (and its associated
     * attributes like 'title') and the URL are actually used.
     *
     * By convention, new or changed plugin content is indicated
     * by a different icon and a corresponding tooltip.
     *
     * @param string $course_id course or institute range id
     * @param int $last_visit time of user's last visit
     * @param string $user_id the user to get the navigation for
     *
     * @return object   navigation item to render or NULL
     */
    public function getIconNavigation($course_id, $last_visit, $user_id)
    {
        // TODO: Implement getIconNavigation() method.
    }

    /**
     * Return a navigation object representing this plugin in the
     * course overview table or return NULL if you want to display
     * no icon for this plugin (or course). The navigation object's
     * title will not be shown, only the image (and its associated
     * attributes like 'title') and the URL are actually used.
     *
     * By convention, new or changed plugin content is indicated
     * by a different icon and a corresponding tooltip.
     *
     * @param string $course_id course or institute range id
     *
     * @return array    navigation item to render or NULL
     */
    public function getTabNavigation($course_id)
    {
        return [
            'yuoshi' => new Navigation(_('yUOShi'), PluginEngine::getURL($this, array(), 'index'))
        ];
    }

    /**
     * @inheritDoc
     */
    public function registerAuthenticatedRoutes(\Slim\App $app)
    {
        $app->get('/courses/{id}/packages', PackagesController::class . ':index');
        $app->post('/courses/{id}/packages', PackagesController::class . ':create');

        $app->get('/packages', PackagesController::class . ':index');
        $app->post('/packages', PackagesController::class . ':create');
        $app->get('/packages/export/{package_id}', PackageImportController::class . ':export');
        $app->post('/packages/import/{course_id}', PackageImportController::class . ':import');
        $app->get('/packages/{id}', PackagesController::class . ':show');
        $app->patch('/packages/{id}', PackagesController::class . ':update');
        $app->delete('/packages/{package_id}', PackagesController::class . ':delete');

        $app->get('/packages/{id}/tasks', TasksController::class . ':index');

        $app->get('/stations', StationController::class . ':index');
        $app->get('/stations/{id}', StationController::class . ':show');
        $app->delete('/stations/{station_id}', StationController::class . ':delete');

        $app->get('/packages/{id}/stations', StationController::class . ':index');
        $app->post('/packages/{id}/stations', StationController::class . ':create');
        $app->post('/stations', StationController::class . ':create');
        $app->get('/stations/{id}/tasks', TasksController::class . ':index');
        $app->get('/stations/{id}/nextTask', TasksController::class . ':nextTask');

        
        $app->get('/tasks', TasksController::class . ':index');
        $app->post('/tasks', TasksController::class . ':create');
        $app->get('/tasks/{id}', TasksController::class . ':show');
        $app->patch('/tasks/{id}', TasksController::class . ':update');
        $app->delete('/tasks/{task_id}', TasksController::class . ':delete');
        $app->get('/tasks/{id}/contents', TaskContentsController::class . ':index');
        $app->get('/tasks/{task_id}/contents/{content_id}', TaskContentsController::class . ':show');
        $app->patch('/tasks/{task_id}/contents/{content_id}', TaskContentsController::class . ':update');
        $app->get('/tasks/{task_id}/task_solutions', TaskSolutionsController::class . ':index');
        $app->get('/tasks/{task_id}/current_task_solution', TaskSolutionsController::class . ':getCurrentSolution');

        $app->get('/task_solutions', TaskSolutionsController::class . ':index');
        $app->get('/task_solutions/{task_solution_id}', TaskSolutionsController::class . ':show');
        $app->patch('/task_solutions/{task_solution_id}', TaskSolutionsController::class . ':update');
        $app->get('/task_solutions/{task_solution_id}/content_solutions', TaskContentSolutionsController::class . ':index');

        $app->get('/content_solutions/{content_solution_id}', TaskContentSolutionsController::class . ':show');
        $app->post('/content_solutions', TaskContentSolutionsController::class . ':create');
        $app->get('/content_solutions/{content_solution_id}/quest_solutions', TaskContentQuestSolutionsController::class . ':index');

        $app->post('/quest_solutions', TaskContentQuestSolutionsController::class . ':create');
        $app->get('/quest_solutions/{quest_solution_id}', TaskContentQuestSolutionsController::class . ':show');
        $app->get('/quest_solutions/{quest_solution_id}/sample_solution', TaskContentQuestSolutionsController::class . ':requestSampleSolution');

        $app->get('/contents', TaskContentsController::class . ':index');
        $app->post('/contents', TaskContentsController::class . ':create');
        $app->patch('/contents/{content_id}', TaskContentsController::class . ':update');
        $app->delete('/contents/{content_id}', TaskContentsController::class . ':delete');
        $app->get('/contents/{id}/quests', TaskContentQuestsController::class . ':index');
        $app->get('/contents/{content_id}/quests/{quest_id}', TaskContentQuestsController::class . ':show');
        $app->patch('/contents/{content_id}/quests/{quest_id}', TaskContentQuestsController::class . ':update');

        $app->get('/quests', TaskContentQuestsController::class . ':index');
        $app->post('/quests', TaskContentQuestsController::class . ':create');
        $app->patch('/quests/{quest_id}', TaskContentQuestsController::class . ':update');
        $app->delete('/quests/{quest_id}', TaskContentQuestsController::class . ':delete');
        $app->get('/quests/{id}/answers', TaskContentQuestAnswersController::class . ':index');
        $app->get('/quests/{quest_id}/answers/{answer_id}', TaskContentQuestAnswersController::class . ':show');
        $app->patch('/quests/{quest_id}/answers/{answer_id}', TaskContentQuestAnswersController::class . ':update');

        $app->get('/answers', TaskContentQuestAnswersController::class . ':index');
        $app->post('/answers', TaskContentQuestAnswersController::class . ':create');
        $app->patch('/answers/{answer_id}', TaskContentQuestAnswersController::class . ':update');
        $app->delete('/answers/{answer_id}', TaskContentQuestAnswersController::class . ':delete');

        $app->get('/yuoshi_images/{image_id}', \Xyng\Yuoshi\Api\Controller\ImagesController::class . ':show');
        $app->post('/yuoshi_images', \Xyng\Yuoshi\Api\Controller\ImagesController::class . ':create');
        $app->post('/yuoshi_images/{image_id}', \Xyng\Yuoshi\Api\Controller\ImagesController::class . ':update');
    }

    /**
     * @inheritDoc
     */
    public function registerUnauthenticatedRoutes(\Slim\App $app)
    {
        // TODO: Implement registerUnauthenticatedRoutes() method.
    }

    /**
     * @inheritDoc
     */
    public function registerSchemas(): array
    {
        return [
            \Xyng\Yuoshi\Model\UserPackageProgress::class => \Xyng\Yuoshi\Api\Schema\UserPackageProgress::class,
            \Xyng\Yuoshi\Model\Packages::class => \Xyng\Yuoshi\Api\Schema\Packages::class,
            \Xyng\Yuoshi\Model\Stations::class => \Xyng\Yuoshi\Api\Schema\Stations::class,
            \Xyng\Yuoshi\Model\Tasks::class => \Xyng\Yuoshi\Api\Schema\Tasks::class,
            \Xyng\Yuoshi\Model\TaskContents::class => \Xyng\Yuoshi\Api\Schema\Contents::class,
            \Xyng\Yuoshi\Model\TaskContentQuests::class => \Xyng\Yuoshi\Api\Schema\Quests::class,
            \Xyng\Yuoshi\Model\TaskContentQuestAnswers::class => \Xyng\Yuoshi\Api\Schema\Answers::class,
            \Xyng\Yuoshi\Model\UserTaskSolutions::class => \Xyng\Yuoshi\Api\Schema\TaskSolutions::class,
            \Xyng\Yuoshi\Model\UserTaskContentSolutions::class => \Xyng\Yuoshi\Api\Schema\TaskContentSolutions::class,
            \Xyng\Yuoshi\Model\UserTaskContentQuestSolutions::class => \Xyng\Yuoshi\Api\Schema\TaskContentQuestSolutions::class,
            \Xyng\Yuoshi\Model\UserTaskContentQuestSolutionAnswers::class => \Xyng\Yuoshi\Api\Schema\TaskContentQuestSolutionAnswers::class,
        ];
    }

    /**
     * {@inheritDoc}
     */
    public function perform($unconsumedPath)
    {
        $this->loadAssets(['main']);

        $trailsRoot = $this->getPluginPath();
        $trailsUri = rtrim(PluginEngine::getLink($this, [], null, true), '/');

        $dispatcher = new Trails_Dispatcher($trailsRoot, $trailsUri, 'yuoshi');
        $dispatcher->plugin = $this;
        $dispatcher->dispatch($unconsumedPath);
    }

    public static function onEnable($pluginId)
    {
        // enable nobody role by default
        \RolePersistence::assignPluginRoles($pluginId, array(7));
    }

    private function loadAssets($keys = [])
    {
        // get webpack manifest
        $path = __DIR__ . DIRECTORY_SEPARATOR . 'dist' . DIRECTORY_SEPARATOR . 'manifest.json';
        $json = file_get_contents($path);

        if ($json) {
            // parse if existing
            $manifest = json_decode($json, true);

            $entries = $manifest['entrypoints'] ?? [];

            foreach ($entries as $key => $entry) {
                if (!in_array($key, $keys)) {
                    continue;
                }
                $scripts = $entry['js'] ?? [];
                foreach ($scripts as $script) {
                    ['src' => $src, 'integrity' => $integrity] = $manifest[$script];

                    // load asset.
                    \PageLayout::addScript(
                        $this->getPluginUrl() . '/dist/' . $src,
                        [
                            'async' => 'async',
                            'integrity' => $integrity
                        ]
                    );
                }

                $styles = $entry['css'] ?? [];
                foreach ($styles as $style) {
                    ['src' => $src] = $manifest[$style];

                    // load asset.
                    \PageLayout::addStylesheet(
                        $this->getPluginUrl() . '/dist/' . $src
                    );
                }
            }
        }
    }
}
