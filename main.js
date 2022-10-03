const regionBaseURL = "https://ibnux.github.io/data-indonesia";
const postalCodeBaseURL = "https://kodepos.vercel.app/search";

const fetchRegionData = (url) => {
  return fetch(`${regionBaseURL}${url}`)
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => err);
};

const fetchPostalCode = (value) => {
  return fetch(`${postalCodeBaseURL}?q=${value}`)
    .then((res) => res.json())
    .then((res) => res)
    .catch((err) => err);
};

const capitalizeString = (string) => {
  const strings = string.split(" ");

  strings.forEach(
    (value, index) =>
      (strings[index] =
        value.charAt(0).toUpperCase() + value.slice(1).toLowerCase())
  );

  return strings.join(" ");
};

const resetChildElement = (targetElement) => {
  while (targetElement.hasChildNodes()) {
    targetElement.removeChild(targetElement.firstChild);
  }
  const optionNode = document.createElement("option");
  optionNode.setAttribute("value", "");
  const textNode = document.createTextNode("-");
  optionNode.appendChild(textNode);

  targetElement.appendChild(optionNode);
};

const appendOptionList = (datas, targetElement) => {
  resetChildElement(targetElement);
  datas.forEach((data) => {
    const optionNode = document.createElement("option");
    optionNode.setAttribute("value", data.id);
    const textNode = document.createTextNode(capitalizeString(data.nama));
    optionNode.appendChild(textNode);

    targetElement.appendChild(optionNode);
  });
};

const updateProvinceData = async (
  provinceInput,
  cityInput,
  districtInput,
  subdistrictInput
) => {
  const datas = await fetchRegionData("/provinsi.json");

  resetChildElement(cityInput);
  resetChildElement(districtInput);
  resetChildElement(subdistrictInput);
  appendOptionList(datas, provinceInput);
};

const updateCityData = async (
  value,
  cityInput,
  districtInput,
  subdistrictInput
) => {
  const datas = await fetchRegionData(`/kabupaten/${value}.json`);

  resetChildElement(districtInput);
  resetChildElement(subdistrictInput);
  appendOptionList(datas, cityInput);
};

const updateDistrictData = async (value, districtInput, subdistrictInput) => {
  const datas = await fetchRegionData(`/kecamatan/${value}.json`);

  resetChildElement(subdistrictInput);
  appendOptionList(datas, districtInput);
};

const updateSubDistrictData = async (subdistrictInput, value) => {
  const datas = await fetchRegionData(`/kelurahan/${value}.json`);

  appendOptionList(datas, subdistrictInput);
};

const getPostalCodeData = async (subDistrictName) => {
  const { data: datas } = await fetchPostalCode(subDistrictName);

  if (!datas) return datas;

  const data = datas.find(
    (e) => e.urban.toLowerCase() === subDistrictName.toLowerCase()
  );

  return data;
};

const updateDataResult = (data) => {
  const postalCodeElement = document.getElementById("postal-code");
  const detailAddressElement = document.getElementById("detail-address");

  if (!data) {
    postalCodeElement.innerHTML = "-";
    detailAddressElement.innerHTML = "Kode pos tidak ditemukan!";
    return;
  }

  const detailAddress = `${data.urban}, ${data.subdistrict}, ${data.city}, ${data.province}`;
  postalCodeElement.innerHTML = data.postalcode;
  detailAddressElement.innerHTML = detailAddress;
};

document.addEventListener("DOMContentLoaded", () => {
  const provinceInput = document.getElementById("province");
  const cityInput = document.getElementById("city");
  const districtInput = document.getElementById("district");
  const subdistrictInput = document.getElementById("subdistrict");

  updateProvinceData(provinceInput, cityInput, districtInput, subdistrictInput);

  provinceInput.addEventListener("change", async (e) => {
    const element = e.target;

    if (element.value === "") return;

    updateCityData(element.value, cityInput, districtInput, subdistrictInput);
  });

  cityInput.addEventListener("change", async (e) => {
    const element = e.target;

    if (element.value === "") return;

    updateDistrictData(element.value, districtInput, subdistrictInput);
  });

  districtInput.addEventListener("change", async (e) => {
    const element = e.target;

    if (element.value === "") return;

    updateSubDistrictData(subdistrictInput, element.value);
  });

  subdistrictInput.addEventListener("change", async (e) => {
    const element = e.target;

    if (element.value === "") return;

    const subDistrictName = element.options[element.selectedIndex].text;
    const data = await getPostalCodeData(subDistrictName);

    updateDataResult(data);
  });
});
