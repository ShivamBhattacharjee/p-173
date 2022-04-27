AFRAME.registerComponent("create-markers", {
  init: async function () {
    var dishes = await this.getDishes();
    console.log(dishes);
    var scene = document.querySelector("#main-scene");
    dishes.map((dish) => {
      var marker = document.createElement("a-marker");
      marker.setAttribute("id", dish.id);
      marker.setAttribute("type", "pattern");
      marker.setAttribute("url", dish.marker_pattern_url);
      marker.setAttribute("cursor", {
        rayOrigin: "mouse",
      });
      marker.setAttribute("marker-id", {});
      scene.appendChild(marker);

      var today = new Date();
      var currentDay = today.getDay();
      var days = [
        "sunday",
        "monday",
        "teusday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
      ];
      if (dish.unavailable_days.includes(days[currentDay])) {
        var pizzamodel = document.createElement("a-entity");
        pizzamodel.setAttribute("id", `model${dish.id}`);
        pizzamodel.setAttribute("position", dish.model_geometry.position);
        pizzamodel.setAttribute("rotation", dish.model_geometry.rotation);
        pizzamodel.setAttribute("scale", dish.model_geometry.scale);
        pizzamodel.setAttribute("gltf-model", `url(${dish.model_url})`);
        pizzamodel.setAttribute("gesture-handle", {});
        pizzamodel.setAttribute("visible", false);

        marker.appendChild(pizzamodel);

        var mainPlane = document.createElement("a-plane");
        mainPlane.setAttribute("id", `mainPlane${dish.id}`);
        mainPlane.setAttribute("position", { x: 0.85, y: 0, z: 0 });
        mainPlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        mainPlane.setAttribute("width", 1.5);
        mainPlane.setAttribute("height", 1.5);
        mainPlane.setAttribute("visible", false);
        marker.appendChild(mainPlane);

        var titlePlane = document.createElement("a-plane");
        titlePlane.setAttribute("id", `titlePlane${dish.id}`);
        titlePlane.setAttribute("position", { x: 0, y: 0.9, z: 0.02 });
        titlePlane.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        titlePlane.setAttribute("width", 1.5);
        titlePlane.setAttribute("height", 0.3);
        titlePlane.setAttribute("material", { color: "orange" });
        titlePlane.setAttribute("visible", true);
        mainPlane.appendChild(titlePlane);

        var dishTitle = document.createElement("a-entity");
        dishTitle.setAttribute("id", `dishTitle${dish.id}`);
        dishTitle.setAttribute("position", { x: 0, y: 0, z: 0.1 });
        dishTitle.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        dishTitle.setAttribute("text", {
          font: "monoid",
          color: "black",
          width: 2,
          height: 1,
          align: "center",
          value: dish.dish_name.toUpperCase(),
        });
        titlePlane.appendChild(dishTitle);

        var ingredients = document.createElement("a-entity");
        ingredients.setAttribute("id", `ingredients${dish.id}`);
        ingredients.setAttribute("position", { x: 0, y: 0, z: 0.1 });
        ingredients.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        ingredients.setAttribute("text", {
          font: "monoid",
          color: "black",
          width: 2,
          height: 1,
          align: "center",
          value: `${dish.ingredient.join("\n\n")}`,
        });
        mainPlane.appendChild(ingredients);

        var pricePlane = document.createElement("a-image");
        pricePlane.setAttribute(
          "src",
          "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/black-circle.png"
        );
        pricePlane.setAttribute("id", `pricePlane-${dish.id}`);
        pricePlane.setAttribute("width", 0.8);
        pricePlane.setAttribute("height", 0.8);
        pricePlane.setAttribute("position", { x: -0.25, y: 0, z: 0 });
        pricePlane.setAttribute("rotation", { x: -90, y: 0, z: 0 });
        pricePlane.setAttribute("visible",false)
        marker.appendChild(pricePlane);

        var price = document.createElement("a-entity");
        price.setAttribute("id", `price-${dish.id}`);
        price.setAttribute("position", { x: -0.03, y: 0.05, z: 0 });
        price.setAttribute("rotation", { x: 0, y: 0, z: 0 });
        price.setAttribute("text", {
          font: "mozillavr",
          color: "white",
          width: 3,
          align: "center",
          value: `only\n ₹${dish.price}`,
        });

        pricePlane.append(price);
      }

      console.log(ingredients);
    });
  },
  getDishes: async function () {
    return await firebase
      .firestore()
      .collection("dishes")
      .get()
      .then((snapshot) => {
        return snapshot.docs.map((doc) => doc.data());
      });
  },
});
