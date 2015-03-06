clear all;
clc;
clf;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%Set input file and plot limits. All you have to do! :)
name = 'mission-2015-03-05_03-05-01.txt';
xmin = 0;   %xmax set automatically
ymin = -3.5;
ymax = 3.5;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%If file contains 'Infinity', textscan will return error
%Resolve this by replacing every occurence with 'NaN'
%That can be done in a texteditor or with the following
%Terminal command when standing in the appropriate directory:
%sed -i.bak s/NaN/Kalle/g $name')
%where '$name' is the filename.
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%%Uncomment valid path

%filename = strcat('/Users/Adam-MBP/Documents/Kandidatarbete/Github/kandidrone/dataAnalysis/Logfiler/',name);
%filename = strcat('/Users/emilrosenberg/Dropbox/Kandidatarbete/Matdata/Logfiler/',name);
%filename = strcat('/Users/JoachimBenjaminsson/Dropbox/Kandidatarbete/Matdata/Logfiler/',name);
filename = strcat('/Users/kalle/Documents/Pill/GitHub/kandidrone/dataAnalysis/Logfiler/',name);
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

%% Plot all data


deltaT = 1/15;
t=linspace(1,length(State_x),length(State_x));
t=t';
t=t.*deltaT;
 
numRows = 3;
numCols = 2;
axisVector = [xmin t(length(t)) ymin ymax];

figure(1)
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

subplot(numRows,numCols,3)
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

subplot(numRows,numCols,4)
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
%}
%%
clf;
clc;
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%Set stepvalues (base and top)
baseValue = 1;
topValue = 1.5;
%Choose which state to monitor
chosenState = 'z';    % x,y or z
disp(strcat('Chosen state: ',chosenState))
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%Extract chosen data
if chosenState == 'x'
    Goal = Goal_x;
    State = State_x;
elseif chosenState == 'y'
    Goal = Goal_y;
    State = State_y;
else
    Goal = Goal_z;
    State = State_z;
end

%Prepare t-vector
deltaT = 1/15;
t=linspace(1,length(State),length(State));
t=t';
t=t.*deltaT;

%Plot steps and responses
%{
figure(2)
subplot(3,1,1)
title('x-koordinat')
hold on
plot(t,Goal_x)
plot(t,State_x)
legend('x-goal','x-state');
hold off

subplot(3,1,2)
title('y-koordinat')
hold on
plot(t,Goal_y)
plot(t,State_y)
legend('y-goal','y-state');
hold off

%subplot(3,1,3)

title('z-koordinat')
hold on
plot(t,Goal_z)
plot(t,State_z)
legend('z-goal','z-state');
hold off
%}

%Extract startIndex and endIndex
startIndex = 0;
endIndex = 0;
i = 1;
while i<length(Goal)
    if Goal(i)==topValue
       startIndex = i;
       break;
    end
    i = i+1;
end
while i<length(Goal)
    if Goal(i)==baseValue
       endIndex = i;
       break;
    end
    i = i+1;
end

%Extract important information
partStep = State(startIndex:endIndex-1);
partGoal = Goal(startIndex:endIndex-1);
partT = t(startIndex:endIndex-1);

%Get stepinfo
ST=0.05;    % 5 percent tolerance for SettlingTime
S=stepinfo(partStep, partT, topValue,'SettlingTimeThreshold',ST);
RiseTime        = getfield(S,'RiseTime')
SettlingTime    = getfield(S,'SettlingTime')
SettlingMin     = getfield(S,'SettlingMin');
SettlingMax     = getfield(S,'SettlingMax');
Overshoot       = getfield(S,'Overshoot');
Undershoot      = getfield(S,'Undershoot');
Peak            = getfield(S,'Peak')
PeakTime        = getfield(S,'PeakTime');
%%


%Feltolerans
t_err=0.1;

% X
startix=0;
endix=0;
for i=1:length(Goal_x)
    if (Goal_x(i)==max(Goal_x) && startix==0 && length(unique(Goal_x))~=1)
        startix=i;
        break
    end
end

% Y
for i=length(Goal_x):-1:1
    if (Goal_x(i)==max(Goal_x) && endix==0 && length(unique(Goal_x))~=1)
        endix=i;
        break
    end
end


% Z
startiy=0;
endiy=0;
for i=1:length(Goal_y)
    if (Goal_y(i)==max(Goal_y) && startiy==0 && length(unique(Goal_y))~=1)
        startiy=i;
        break
    end
end

for i=length(Goal_y):-1:1
    if (Goal_y(i)==max(Goal_y) && endiy==0 && length(unique(Goal_y))~=1)
        endiy=i;
        break
    end
end


startiz=0;
endiz=0;
for i=1:length(Goal_z)
    if (Goal_z(i)==max(Goal_z) && startiz==0 && length(unique(Goal_z))~=1)
        startiz=i;
        break
    end
end

for i=length(Goal_z):-1:1
    if (State_z(i)>=max(Goal_z) && endiz==0 && length(unique(Goal_z))~=1)
        endiz=i;
        break
    end
end

if(startix~=0)
tx=(startix:endix);
stax=State_x(startix:endix);
Sx=stepinfo(State_x(startix:endix),tx)
end

if(startiy~=0)
ty=(startiy:endiy);
stay=State_y(startiy:endiy);
Sy=stepinfo(State_y(startiy:endiy),ty)
end

if(startiz~=0)
tz=(startiz:endiz);
staz=State_z(startiz:endiz);
Sz=stepinfo(State_z(startiz:endiz),tz,max(Goal_z),'SettlingTimeThreshold',0.1)
end





