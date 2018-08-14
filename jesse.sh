git show --name-status | tee output.txt
count=0
while read LINE
do
counter=$((counter+1))
if [[ "$counter" -gt 6 ]]; then
	filelocation=($LINE)
	folders=${filelocation[1]}
  	#echo "${folders}"
  	if [[ $folders = *"/"* ]]; then
  		echo "${folders%%/*}" >> folders.txt
	fi
fi
done < output.txt
sort -u folders.txt > unique_folders.txt
for FILE in `cat unique_folders.txt`;
	do cd $FILE
	chmod +x deploy.sh
	./deploy.sh
	#echo "aws lambda list-functions | awk '/${FILE}/' > tmp.txt"
	var=$(aws lambda list-functions | awk "/${FILE}/")
	two=$(cut -d '"' -f4  <<< "$var")
	twonames=($two)
	echo "starting to update ${twonames[1]} lambda function"
	aws lambda update-function-code --function-name ${twonames[1]}  --zip-file "fileb://${FILE}.zip"
	echo "finish updating"  
	#rm tmp.txt
	cd ..
done