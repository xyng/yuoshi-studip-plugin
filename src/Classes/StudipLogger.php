<?php
namespace Xyng\Yuoshi\Classes;

use Log;
use Psr\Log\LoggerInterface;

class StudipLogger implements LoggerInterface {
    /**
     * @inheritDoc
     */
    public function emergency($message, array $context = array())
    {
        Log::FATAL($message);
    }

    /**
     * @inheritDoc
     */
    public function alert($message, array $context = array())
    {
        Log::ALERT($message);
    }

    /**
     * @inheritDoc
     */
    public function critical($message, array $context = array())
    {
        Log::CRITICAL($message);
    }

    /**
     * @inheritDoc
     */
    public function error($message, array $context = array())
    {
        Log::ERROR($message);
    }

    /**
     * @inheritDoc
     */
    public function warning($message, array $context = array())
    {
        Log::WARNING($message);
    }

    /**
     * @inheritDoc
     */
    public function notice($message, array $context = array())
    {
        Log::NOTICE($message);
    }

    /**
     * @inheritDoc
     */
    public function info($message, array $context = array())
    {
        Log::INFO($message);
    }

    /**
     * @inheritDoc
     */
    public function debug($message, array $context = array())
    {
        Log::DEBUG($message);
    }

    /**
     * @inheritDoc
     */
    public function log($level, $message, array $context = array())
    {
        Log::get()->log($message, $level);
    }
}
