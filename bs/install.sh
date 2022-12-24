#! /usr/bin/env zsh

/home/rg/.deno/bin/deno compile --allow-env --allow-read --allow-net --allow-write --output borg /home/rg/Code/ws/axon/borg-cli/src/cli.ts

sudo rm /usr/bin/borg
sudo ln -s /home/rg/Code/ws/axon/borg-cli/borg /usr/bin/borg
