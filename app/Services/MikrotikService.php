<?php

namespace App\Services;

use App\Models\Customer;
use Illuminate\Support\Facades\Log;
use phpseclib3\Net\SSH2;

class MikrotikService
{
    protected $ssh;

    public function __construct()
    {
        $host = config('mikrotik.ssh.host');
        $username = config('mikrotik.ssh.username');
        $password = config('mikrotik.ssh.password');

        if (!is_string($host) || !is_string($username) || !is_string($password)) {
            throw new \Exception('MikroTik SSH host, username, or password is not configured correctly.');
        }

        $this->ssh = new SSH2($host);
        if (!$this->ssh->login($username, $password)) {
            throw new \Exception('MikroTik SSH login failed.');
        }
    }

    public function secretExists(string $secretName): bool
    {
        Log::info("Checking if secret exists: {$secretName}");
        $command = '/ppp secret print where name="' . $secretName . '"
';
        $output = $this->ssh->exec($command);
        Log::info("MikroTik command: {$command}, Output: {$output}");
        return strpos($output, $secretName) !== false;
    }

    public function disableSecret(string $secretName)
    {
        Log::info("Disabling secret: {$secretName}");
        $command = '/ppp secret set [find name="' . $secretName . '"] disabled=yes
';
        $output = $this->ssh->exec($command);
        Log::info("MikroTik command: {$command}, Output: {$output}");
    }

    public function createOrEnableSecret(Customer $customer)
    {
        $secretName = $customer->name;
        $profile = $customer->plan->mikrotik_profile;
        $password = config('mikrotik.pppoe_password');

        if (!$profile) {
            Log::error("No MikroTik profile found in database for plan: {$customer->plan->name}");
            return;
        }

        if ($this->secretExists($secretName)) {
            Log::info("Enabling/Updating secret: {$secretName} with profile {$profile}");
            $command = '/ppp secret set [find name="' . $secretName . '"] disabled=no profile=' . $profile . '
';
            $output = $this->ssh->exec($command);
            Log::info("MikroTik command: {$command}, Output: {$output}");
        } else {
            Log::info("Creating secret: {$secretName} with profile {$profile}");
            $command = '/ppp secret add name="' . $secretName . '" password=' . $password . ' service=pppoe profile=' . $profile . '
';
            $output = $this->ssh->exec($command);
            Log::info("MikroTik command: {$command}, Output: {$output}");
        }
    }

    public function getMikrotikPppoeProfiles(): array
    {
        Log::info("Fetching MikroTik PPPoE profiles.");
        $command = '/ppp profile print
';
        $output = $this->ssh->exec($command);
        Log::info("MikroTik command: {$command}, Output: {$output}");

        $profiles = [];
        // Parse the output to extract profile names
        // Assuming output format like: " 0   name="default" local-address=0.0.0.0 remote-address=0.0.0.0 ..."
        preg_match_all('/name="([^"]+)"/', $output, $matches);
        if (isset($matches[1])) {
            $profiles = $matches[1];
        }

        return $profiles;
    }
}