#!/usr/bin/php
<?php
exec('ls -1 /arquivos/auth/ | wc -l',$saida);
print_r($saida[0]);
echo "\n";
