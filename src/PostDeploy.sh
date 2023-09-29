
ENV=$(get_octopusvariable Octopus.Environment.Name)
echo "Environment is ${ENV}"

cp assets/config.${ENV}.json assets/config.json

lowerENV=$(echo $ENV | tr A-Z a-z)
[ "$lowerENV" = "production" ] && lowerENV=
folder=/var/www/${lowerENV}optionpi.algomerchant.com


# create directory if not exists
[ -d "${folder}" ] || sudo mkdir -p ${folder}

sudo rm -rf ${folder}/*
sudo mv * ${folder}/

sudo chown nginx:nginx -R ${folder}
