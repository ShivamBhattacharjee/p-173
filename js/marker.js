var tableNumber = null;
AFRAME.registerComponent("marker-id", {
  init: async function () {
    var dishes = await this.getDishes();

    if (tableNumber == null) {
      this.addTableNumber();
    }

    this.el.addEventListener("markerFound", () => {
      if (tableNumber !== null) {
        var markerId = this.el.id;
        this.markerFound(dishes, markerId);
      }
    });

    this.el.addEventListener("markerLost", () => {
      this.markerLost();
    });
  },

  markerFound: function (dishes, markerId) {
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
    var dish = dishes.filter((dish) => dish.id === markerId)[0];
    if (dish.unavailable_days.includes(days[currentDay])) {
      swal({
        icon: "warning",
        title: dish.dish_name.toUpperCase(),
        text: "This dish is not available today",
        button: false,
      });
    } else {
      var model = document.querySelector(`#model${dish.id}`);
      model.setAttribute("visible", true);
      model.setAttribute("position", dish.model_geometry.position);
      model.setAttribute("rotation", dish.model_geometry.rotation);
      model.setAttribute("scale", dish.model_geometry.scale);

      var mainPlane = document.querySelector(`#mainPlane${dish.id}`);
      mainPlane.setAttribute("visible", true);

      var pricePlane = document.querySelector(`#pricePlane-${dish.id}`);
      pricePlane.setAttribute("visible", true);
    }

    var buttonDiv = document.getElementById("button-id");
    buttonDiv.style.display = "flex";
    var ratingButton = document.getElementById("rating-button");
    var orderButton = document.getElementById("order-button");
    var orderSummaryButton = document.getElementById("order-summary");

    ratingButton.addEventListener("click", () => {
      swal({
        title: "rate dish",
        text: "icon",
        icon: "https://imgur.com/4NZ6uLY",
      });
    });

    orderButton.addEventListener("click", () => {
      var tnumber;
      tableNumber <= 9 ? (tnumber = `T0${tableNumber}`) : `T${tableNumber}`;
      this.handleOrder(tnumber, dish);

      swal({
        title: "order now",
        text: "your order will be served soon",
        icon: "info",
      });
    });

    orderSummaryButton.addEventListener("click", () => {
      this.handleSummary();
    });
  },

  markerLost: function () {
    var buttonDiv = document.getElementById("button-id");
    buttonDiv.style.display = "none";
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

  addTableNumber: function () {
    var iconUrl =
      "https://raw.githubusercontent.com/whitehatjr/menu-card-app/main/hunger.png";
    swal({
      title: "welcome to zinger-burger cafe",
      icon: iconUrl,
      content: {
        element: "input",
        attributes: {
          placeHolder: "Type your table number",
          type: "number",
          min: 1,
        },
      },
      closeOnClickOutside: false,
    }).then((inputValue) => {
      tableNumber = inputValue;
    });
  },
  handleOrder: async function (tnumber, dish) {
    await firebase
      .firestore()
      .collection("tables")
      .doc(tnumber)
      .get()
      .then((doc) => {
        var details = doc.data();
        if (details["current_orders"][dish.id]) {
          details["current_orders"][dish.id]["quantity"] += 1;

          var currentQuantity = details["current_orders"][dish.id]["quantity"];
          details["current_orders"][dish.id]["subtotal"] =
            currentQuantity * dish.price;
        } else {
          details["current_orders"][dish.id] = {
            item: dish.dish_name,
            price: dish.price,
            quantity: 1,
            subtotal: dish.price * 1,
          };
        }
        details.total_bill += dish.price;
        firebase.firestore().collection("tables").doc(doc.id).update(details);
      });
  },

  getOrderSummary: async function (tnumber) {
    return await firebase
      .firestore()
      .collection("tables")
      .doc(tnumber)
      .get()
      .then((doc) => doc.data());
  },

  handleSummary: async function () {
    var tnumber;
    tableNumber <= 9 ? (tnumber = `T0${tableNumber}`) : `T${tableNumber}`;
    var orderSummary = await this.getOrderSummary(tnumber);
    var model_div = document.getElementById("modal-div");
    model_div.style.display = "flex";
    var table_id = document.getElementById("bill-table-body");
    table_id.innerHTML = "";
    var currentOrders = Object.keys(orderSummary.current_orders);
    currentOrders.map((i) => {
      var table = document.createElement("tr");
      var item = document.createElement("td");
      var price = document.createElement("td");
      var quantity = document.createElement("td");
      var subtotal = document.createElement("td");

      item.innerHTML = orderSummary.current_orders[i].item;
      price.innerHTML = orderSummary.current_orders[i].price;
      quantity.innerHTML = orderSummary.current_orders[i].quantity;
      suntotal.innerHTML = orderSummary.current_orders[i].subtotal;

      // sytling to all the td
      price.setAttribute("class", "text-center");
      quantity.setAttribute("class", "text-center");
      subtotal.setAttribute("class", "text-center");

      table.appendChild(item);
      table.appendChild(quantity);
      table.appendChild(subtotal);
      table.appendChild(price);

      table_id.appendChild(table);
    });
  },
});
