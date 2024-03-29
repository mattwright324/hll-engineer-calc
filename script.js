(function () {
    $(window).init(function () {
        console.log("window init")
        $("input[type='number']").inputSpinner();
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))

        function formatDuration(duration, includeMs, ignoreTime) {
            const years = duration.years();
            const months = duration.months();
            const days = duration.days();
            const hours = duration.hours();
            const minutes = duration.minutes();
            const seconds = duration.seconds();
            const millis = duration.milliseconds();
            const format = [
                (years > 0 ? years + " years" : ""),
                (months > 0 ? months + " months" : ""),
                (days > 0 ? days + " days" : ""),
                (!ignoreTime && hours > 0 ? hours + "h" : ""),
                (!ignoreTime && minutes > 0 ? minutes + "m" : ""),
                (!ignoreTime && seconds > 0 ? seconds + "s" : ""),
                includeMs ? (millis > 0 ? millis + "ms" : "") : ""
            ].join(" ");

            if (format.trim() === "") {
                return "0s";
            }

            return format;
        }

        const suppliesPerRun = 300;
        const metersPerSecond = 8.69;
        const barricadePerPerson = 4;
        const bunkerPerPerson = 1;

        function calculate() {
            const values = {}
            $("input[type='number']").each(function (i, e) {
                values[e.id] = {
                    value: Number($(e).val()),
                    cost: $(e).data('cost'),
                    perPerson: $(e).data('per-person'),
                    personType: $(e).data('person'),
                };
            })

            const people = {
                engi: 0,
                at: 0
            }
            let totalSupplies = 0;
            for (key in values) {
                const item = values[key];
                if (item.value && item.cost) {
                    totalSupplies += item.value * item.cost;
                }
                if (key.startsWith("bunker") || key.startsWith("barricade")) {
                    continue
                }
                if (item.perPerson && item.personType && item.value) {
                    people[item.personType] = Math.max(people[item.personType], Math.ceil(item.value / item.perPerson))
                }
            }
            people.engi = Math.max(people.engi, Math.ceil((values.barricade1.value + values.barricade2.value + values.barricade3.value) / barricadePerPerson))
            people.engi = Math.max(people.engi, Math.ceil((values.bunker1.value + values.bunker2.value + values.bunker3.value) / bunkerPerPerson))
            $("#total-supplies").text(totalSupplies);
            $("#total-engineers").text(0);
            const peopleStr = [
                "<span class='orange'>" + people.engi + "</span> engineer(s)"
            ];
            if (people.at) {
                peopleStr.push("<span class='orange'>" + people.at + "</span> AT(s)")
            }
            if (values.garrison.value) {
                peopleStr.push("at least <span class='orange'>1</span> leader(s)")
            }
            $("#people").html(peopleStr.join(", "))

            const truckRuns = Math.ceil(totalSupplies / suppliesPerRun);
            $("#total-truck-runs").text(truckRuns)

            const driveTimeMeters = truckRuns * (values?.distance?.value || 0);
            const driveTimeSec = driveTimeMeters / metersPerSecond;
            const driveTime = moment.duration({"seconds": driveTimeSec});

            console.log("%s meters, %s sec", driveTimeMeters, driveTimeSec)

            $("#approx-drive-time").text(formatDuration(driveTime))

            console.log(values);
        }

        $("input[type='number']").change(calculate);
        calculate();

        $("#reset").click(function () {
            $("input[type='number']").val(0)
            $("#distance").val(1400).trigger('change')
        })
    })
}());
