for FILE in `cat folders.txt`;
do
cd $FILE
chmod +x deploy.sh
./deploy.sh
cd ..
done