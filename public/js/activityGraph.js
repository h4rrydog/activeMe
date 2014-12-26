var chart = c3.generate({
    bindto: '#activityChart',
    data: activityData,
    axis: {
        x: {
            type: 'timeseries',
            tick: {
                format: '%Y-%m-%d'
            }
        }
    }
});