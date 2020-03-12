#!/usr/bin/php
<?php
//mostra a quantidade de imagens enviadas
exec('ls -1 /arquivos/auth/ | wc -l',$saida);
print_r($saida[0]);
echo "\n";
