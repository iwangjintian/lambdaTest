#!/bin/bash
git show --name-status | tee output.txt
# count=0
# while read LINE
# do
# counter=$((counter+1))
# if [ "$counter" -gt 6 ]
# then
#   filelocation=($LINE)
#   folders=${filelocation[1]}
#     #echo "${folders}"
#     if [[ $folders = *"/"* ]]
#     then
#       echo "${folders%%/*}" >> folders.txt
#   	fi
# fi
# done < output.txt
# if [ -f folders.txt ]
# then
#   #cat folders.txt
#   sort -u folders.txt >> unique_folders.txt
#   #cat unique_folders.txt
#   for FILE in `cat unique_folders.txt`;do cd $FILE;chmod +x deploy.sh;./deploy.sh;cd ..;done
# fi
