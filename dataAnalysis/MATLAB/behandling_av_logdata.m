clear all;
clc;
clf;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%Set input file and plot limits. All you have to do! :)
name = 'mission-2015-03-05_02-29-44.txt';
xmin = 0;   %xmax set automatically
zoom = 2;   %set zoom level fast. Options: 1,2,3 (3 most zoomed in)
if zoom == 1
    ymin = -3.5;
    ymax = 3.5;
elseif zoom == 2
    ymin = -1.5;
    ymax = 1.5;
elseif zoom == 3
    ymin = -0.5;
    ymax = 0.5;
else        %Default
    ymin = -1;
    ymax = 1;
end   

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%If file contains 'Infinity', textscan will return error
%Resolve this by replacing every occurence with 'NaN'
%That can be done in a texteditor or with the following
%Terminal command when standing in the appropriate directory:
%sed -i.bak s/NaN/Kalle/g $name')
%where '$name' is the filename.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%Uncomment valid path
%filename = strcat('/Users/Adam-MBP/Dropbox/Kandidatarbete/Matdata/Logfiler/',name);
%filename = strcat('/Users/emilrosenberg/Dropbox/Kandidatarbete/Matdata/Logfiler/',name);
%filename = strcat('/Users/JoachimBenjaminsson/Dropbox/Kandidatarbete/Matdata/Logfiler/',name);
filename = strcat('/Users/kalle/Dropbox/Kandidatarbete/Matdata/Logfiler/',name);
delimiter = ',';
%Format
formatSpec = '%f%f%f%f%f%f%f%f%f%s%f%f%f%f%f%f%f%f%[^\n\r]';
%Open file
fileID = fopen(filename,'r');
%Read data
dataArray = textscan(fileID, formatSpec, 'Delimiter', delimiter,  'ReturnOnError', false);
%Close file
fclose(fileID);
%Allocate imported array to column variable names
State_x = dataArray{:, 1};
State_y = dataArray{:, 2};
State_z = dataArray{:, 3};
State_yaw = dataArray{:, 4};
State_vx = dataArray{:, 5};
State_vy = dataArray{:, 6};
Goal_x = dataArray{:, 7};
Goal_y = dataArray{:, 8};
Goal_z = dataArray{:, 9};
Goal_yaw = dataArray{:, 10};
Ex = dataArray{:, 11};
Ey = dataArray{:, 12};
Ez = dataArray{:, 13};
Eyaw = dataArray{:, 14};
Control_ux = dataArray{:, 15};
Control_uy = dataArray{:, 16};
Control_uz = dataArray{:, 17};
Control_uyaw = dataArray{:, 18};

%%Clear temporary variables
clearvars filename delimiter formatSpec fileID dataArray ans;

%%Plot data

deltaT = 1/15;
t=linspace(1,length(State_x),length(State_x));
t=t';
t=t.*deltaT;

numRows = 3;
numCols = 2;
axisVector = [xmin t(length(t)) ymin ymax];

subplot(numRows,numCols,1)
hold on
plot(t,State_x)
plot(t,State_y)
plot(t,State_z)
plot(t,State_yaw)
plot([t(1),t(length(t))],[0,0],'k')
plot([t(1),t(length(t))],[1,1],'k')
hold off
legend('State x','State y','State z','State yaw');
title('States-positions');
text(0, 1.5, name, 'Color', 'r');
axis(axisVector);
xlabel('Tid [s]')
ylabel('Amplitud [m]')

subplot(numRows,numCols,2)
hold on
plot(t,State_vx)
plot(t,State_vy)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('States-velocities');
legend('State vx','State vy');
axis(axisVector);
xlabel('Tid [s]')

subplot(numRows,numCols,4)
hold on
plot(t,Goal_x)
plot(t,Goal_y)
plot(t,Goal_z)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('Goals-positions');
legend('Goal x','Goal y','Goal z');
axis(axisVector);
xlabel('Tid [s]')

subplot(numRows,numCols,3)
hold on
plot(t,Ex)
plot(t,Ey)
plot(t,Ez)
plot(t,Eyaw)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('Errors-positions');
legend('Ex','Ey','Ez','Eyaw');
axis(axisVector);
xlabel('Tid [s]')

subplot(numRows,numCols,5)
hold on
plot(t,Control_ux)
plot(t,Control_uy)
plot(t,Control_uz)
plot(t,Control_uyaw)
plot([t(1),t(length(t))],[0,0],'k')
hold off
title('Control signals from PID');
legend('Control_ux','Control_uy','Control_uz','Control_uyaw');
axis(axisVector);
xlabel('Tid [s]')